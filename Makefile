# ==============================================================================
# Professional Makefile for the "shenqi-box" Anchor Workspace Project
# ==============================================================================
# This file helps automate common tasks for your multi-program Solana project.
# It includes dynamic cluster selection, code quality checks, and versioning tools.

# --- Configuration ---

# Load environment variables from .env file.
# The `-` before `include` suppresses errors if the file doesn't exist.
-include .env
export

# Define the default cluster. Can be overridden from the command line.
# Example: make deploy CLUSTER=localnet
CLUSTER ?= devnet

# Define RPC URLs for different clusters.
# You can store your sensitive URLs in the .env file.
# Example .env file:
# DEVNET_RPC_URL="https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY"
# MAINNET_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"
LOCALNET_RPC_URL := http://localhost:8899
DEVNET_RPC_URL ?= https://api.devnet.solana.com
MAINNET_RPC_URL ?= https://api.mainnet-beta.solana.com

# Select the RPC URL based on the CLUSTER variable.
ifeq ($(CLUSTER), localnet)
    RPC_URL := $(LOCALNET_RPC_URL)
else ifeq ($(CLUSTER), devnet)
    RPC_URL := $(DEVNET_RPC_URL)
else ifeq ($(CLUSTER), mainnet-beta)
    RPC_URL := $(MAINNET_RPC_URL)
else
    $(error Invalid CLUSTER specified. Use localnet, devnet, or mainnet-beta)
endif

# Default wallet path.
WALLET ?= ~/.config/solana/id.json

# Priority fee in micro-lamports.
COMPUTE_UNIT_PRICE ?= 100000

# --- Program Configuration ---

# Define your programs here for easier management
PROGRAMS := metaplex_nft shenqi-box

# Build artifacts
PROGRAM_SO := target/deploy/$(PROGRAM).so
IDL_JSON := target/idl/$(PROGRAM).json

# --- Helper Variables ---
PROVIDER_ARGS := --provider.cluster $(RPC_URL) --provider.wallet $(WALLET)

# --- Main Commands ---

.PHONY: all build build-one clean test test-one deploy upgrade idl-init idl-upgrade size changelog lint fmt archive-idl help setup install-deps verify-programs start-localnet stop-localnet logs check-balance check-cluster show-accounts reset-localnet

all: build ## Build all programs in the workspace.

# --- Project Setup & Dependencies ---

setup: ## Initial project setup - install dependencies and verify tools.
	@echo "Setting up project..."
	@echo "Checking Solana CLI..."
	@which solana || (echo "Solana CLI not found. Please install it first." && exit 1)
	@echo "Checking Anchor CLI..."
	@which anchor || (echo "Anchor CLI not found. Please install it first." && exit 1)
	@echo "Installing dependencies..."
	@pnpm install
	@echo "Setup complete!"

install-deps: ## Install/update project dependencies.
	@echo "Installing dependencies with pnpm..."
	@pnpm install
	@echo "Dependencies installed."

verify-programs: ## Verify that all programs are properly configured.
	@echo "Verifying program configurations..."
	@for program in $(PROGRAMS); do \
		if [ ! -f "programs/$$program/Cargo.toml" ]; then \
			echo "Error: Program $$program not found in programs/$$program/Cargo.toml"; \
			exit 1; \
		fi; \
		echo "✓ Program $$program found"; \
	done
	@echo "All programs verified."

# --- Project Setup & Cleaning ---

clean: ## Clean build artifacts and reinstall dependencies.
	@echo "Cleaning project and reinstalling dependencies..."
	@rm -rf target/
	@rm -rf node_modules/
	@rm -f yarn.lock pnpm-lock.yaml bun.lockb
	@pnpm install
	@echo "Done."

clean-build: ## Clean only build artifacts (keep dependencies).
	@echo "Cleaning build artifacts..."
	@rm -rf target/
	@echo "Build artifacts cleaned."

# --- Code Quality ---

fmt: ## Format all Rust code in the workspace.
	@echo "Formatting Rust code..."
	@cargo fmt --all

fmt-check: ## Check if Rust code is properly formatted.
	@echo "Checking Rust code formatting..."
	@cargo fmt --all -- --check

lint: fmt ## Run all linter checks (typos, clippy, etc.).
	@echo "Running linter checks..."
	@echo "Checking for typos..."
	@typos . || echo "Warning: typos not installed. Install with: cargo install typos-cli"
	@echo "Running clippy..."
	@cargo clippy --all -- -D warnings
	@echo "Running TypeScript/JavaScript linting..."
	@pnpm lint

lint-fix: ## Fix linting issues automatically.
	@echo "Fixing linting issues..."
	@pnpm lint:fix

# --- Build & Test ---

build: verify-programs ## Build all programs in the workspace.
	@echo "Building all programs: $(PROGRAMS)..."
	@anchor build

build-one: verify-programs ## Build a specific program. Usage: make build-one PROGRAM=<program_name>
	@if [ -z "$(PROGRAM)" ]; then \
		echo "Error: Usage: make build-one PROGRAM=<program_name>" >&2; \
		echo "Available programs: $(PROGRAMS)" >&2; \
		exit 1; \
	fi
	@echo "Building single program: [$(PROGRAM)]..."
	@anchor build --program-name $(PROGRAM)

test: build ## Run all tests against the localnet.
	@echo "Running all tests for the workspace..."
	@anchor test --provider.cluster localnet



test-program: ## Test a specific program. Usage: make test-program PROGRAM=<program_name> [CLUSTER=localnet] [SKIP_DEPLOY=true]
	@if [ -z "$(PROGRAM)" ]; then \
		echo "Error: Usage: make test-program PROGRAM=<program_name>" >&2; \
		echo "Available programs: $(PROGRAMS)" >&2; \
		exit 1; \
	fi
	@echo "Testing program [$(PROGRAM)] on $(CLUSTER)..."
	@if [ "$(CLUSTER)" = "localnet" ]; then \
		echo "Using anchor test with automatic local validator..."; \
		if [ "$(SKIP_DEPLOY)" = "true" ]; then \
			echo "Skipping deployment, testing deployed program..."; \
			NETWORK=$(CLUSTER) RPC_URL=$(RPC_URL) ANCHOR_PROVIDER_URL=$(RPC_URL) ANCHOR_WALLET=$(WALLET) anchor test --skip-deploy --run tests/$(PROGRAM).ts; \
		else \
			echo "Deploying and testing program..."; \
			NETWORK=$(CLUSTER) RPC_URL=$(RPC_URL) ANCHOR_PROVIDER_URL=$(RPC_URL) ANCHOR_WALLET=$(WALLET) anchor test --program-name $(PROGRAM) --run tests/$(PROGRAM).ts; \
		fi; \
	else \
		echo "Using RPC URL: $(RPC_URL)"; \
		if [ "$(SKIP_DEPLOY)" = "true" ]; then \
			echo "Skipping deployment, testing deployed program..."; \
			NETWORK=$(CLUSTER) RPC_URL=$(RPC_URL) ANCHOR_PROVIDER_URL=$(RPC_URL) ANCHOR_WALLET=$(WALLET) anchor test --skip-deploy --provider.cluster $(RPC_URL) --run tests/$(PROGRAM).ts; \
		else \
			echo "Deploying and testing program..."; \
			NETWORK=$(CLUSTER) RPC_URL=$(RPC_URL) ANCHOR_PROVIDER_URL=$(RPC_URL) ANCHOR_WALLET=$(WALLET) anchor test --program-name $(PROGRAM) --provider.cluster $(RPC_URL) --run tests/$(PROGRAM).ts; \
		fi; \
	fi

test-metaplex-nft: build ## Test metaplex_nft program only. Usage: make test-metaplex-nft [CLUSTER=devnet]
	@echo "Testing metaplex_nft program on $(CLUSTER)..."
	@echo "Using RPC URL: $(RPC_URL)"
	@NETWORK=$(CLUSTER) RPC_URL=$(RPC_URL) ANCHOR_PROVIDER_URL=$(RPC_URL) ANCHOR_WALLET=$(WALLET) pnpm exec tsx scripts/test-metaplex-nft.ts

# --- Code Coverage ---

coverage: ## Generate test coverage for all programs in the workspace.
	@echo "Generating test coverage for all programs..."
	@mucho coverage
	@echo "Coverage report generated. Open coverage/html/index.html to view."

# --- Program Size Analysis ---

size: build ## Check the size of all compiled program binaries.
	@echo "Checking program sizes..."
	@for program in $(PROGRAMS); do \
		echo "--- $$program ---"; \
		ls -lh target/deploy/$$program.so; \
	done

# --- Deployment & IDL Management ---

deploy: build ## Deploy a specific program with priority fees. Usage: make deploy PROGRAM=<program_name> [CLUSTER=devnet]
	@if [ -z "$(PROGRAM)" ]; then \
		echo "Error: Usage: make deploy PROGRAM=<program_name>" >&2; \
		echo "Available programs: $(PROGRAMS)" >&2; \
		exit 1; \
	fi
	@echo "Deploying program [$(PROGRAM)] with priority fee to cluster: $(CLUSTER)..."
	@echo "Using RPC URL: $(RPC_URL)"
	@echo "Priority fee: $(COMPUTE_UNIT_PRICE) micro-lamports"
	@anchor deploy \
		--program-name $(PROGRAM) \
		--provider.cluster $(RPC_URL) \
		--provider.wallet $(WALLET) \
		-- --with-compute-unit-price $(COMPUTE_UNIT_PRICE)



upgrade: build ## Upgrade a deployed program. Usage: make upgrade PROGRAM=<program_name> PROGRAM_ID=<program_id>
	@if [ -z "$(PROGRAM)" ] || [ -z "$(PROGRAM_ID)" ]; then \
		echo "Error: Usage: make upgrade PROGRAM=<program_name> PROGRAM_ID=<program_id>" >&2; \
		exit 1; \
	fi
	@echo "Upgrading program [$(PROGRAM)] with ID [$(PROGRAM_ID)] on cluster: $(CLUSTER)..."
	@anchor upgrade target/deploy/$(PROGRAM).so --program-id $(PROGRAM_ID) $(PROVIDER_ARGS) -- --with-compute-unit-price $(COMPUTE_UNIT_PRICE)

idl-init: ## Initialize the IDL account for a deployed program. Usage: make idl-init PROGRAM=<program_name> PROGRAM_ID=<program_id>
	@if [ -z "$(PROGRAM)" ] || [ -z "$(PROGRAM_ID)" ]; then \
		echo "Error: Usage: make idl-init PROGRAM=<program_name> PROGRAM_ID=<program_id>" >&2; \
		exit 1; \
	fi
	@echo "Initializing IDL for program [$(PROGRAM)] with ID [$(PROGRAM_ID)] on cluster: $(CLUSTER)..."
	@anchor idl init --filepath target/idl/$(PROGRAM).json $(PROGRAM_ID) $(PROVIDER_ARGS)

idl-upgrade: build ## Upgrade the IDL for a deployed program. Usage: make idl-upgrade PROGRAM=<program_name> PROGRAM_ID=<program_id>
	@if [ -z "$(PROGRAM)" ] || [ -z "$(PROGRAM_ID)" ]; then \
		echo "Error: Usage: make idl-upgrade PROGRAM=<program_name> PROGRAM_ID=<program_id>" >&2; \
		exit 1; \
	fi
	@echo "Upgrading IDL for program [$(PROGRAM)] with ID [$(PROGRAM_ID)] on cluster: $(CLUSTER)..."
	@anchor idl upgrade --filepath target/idl/$(PROGRAM).json $(PROGRAM_ID) $(PROVIDER_ARGS)

# --- Versioning & Archiving ---

changelog: ## Generate a changelog for a program. Usage: make changelog PROGRAM=<program_name>
	@if [ -z "$(PROGRAM)" ]; then \
		echo "Error: Usage: make changelog PROGRAM=<program_name>" >&2; \
		exit 1; \
	fi
	@echo "Generating changelog for [$(PROGRAM)]..."
	@git cliff --config cliff.toml --tag-pattern "$(PROGRAM)/v[0-9]*" -o programs/$(PROGRAM)/CHANGELOG.md
	@echo "Changelog generated at programs/$(PROGRAM)/CHANGELOG.md"

archive-idl: build ## Archive the current IDL for a program. Usage: make archive-idl PROGRAM=<program_name>
	@if [ -z "$(PROGRAM)" ]; then \
		echo "Error: Usage: make archive-idl PROGRAM=<program_name>" >&2; \
		exit 1; \
	fi
	@echo "Archiving IDL for [$(PROGRAM)]..."
	@mkdir -p idls/$(PROGRAM)
	@TIMESTAMP=$$(date +'%Y-%m-%d-%H%M%S'); \
	SOURCE_FILE="target/idl/$(PROGRAM).json"; \
	DEST_FILE="idls/$(PROGRAM)/$(PROGRAM)-$${TIMESTAMP}.json"; \
	cp "$${SOURCE_FILE}" "$${DEST_FILE}"; \
	echo "IDL for $(PROGRAM) successfully archived to $${DEST_FILE}"

# --- Development Tools ---

start-localnet: ## Start a local Solana validator for development.
	@echo "Starting local Solana validator..."
	@solana-test-validator --reset

stop-localnet: ## Stop the local Solana validator.
	@echo "Stopping local Solana validator..."
	@pkill -f solana-test-validator || echo "No local validator running"

reset-localnet: stop-localnet start-localnet ## Reset the local Solana validator (stop and restart).
	@echo "Local validator reset complete!"

logs: ## Show logs from the local validator.
	@echo "Showing local validator logs..."
	@tail -f ~/.local/share/solana/install/active_release/log/solana-validator.log

# --- Utility Commands ---

check-balance: ## Check wallet balance on the current cluster.
	@echo "Checking wallet balance on $(CLUSTER)..."
	@solana balance --url $(RPC_URL)

check-cluster: ## Show current cluster configuration.
	@echo "Current cluster configuration:"
	@echo "  Cluster: $(CLUSTER)"
	@echo "  RPC URL: $(RPC_URL)"
	@echo "  Wallet: $(WALLET)"
	@echo "  Programs: $(PROGRAMS)"

show-accounts: ## Show program accounts for a specific program. Usage: make show-accounts PROGRAM=<program_name>
	@if [ -z "$(PROGRAM)" ]; then \
		echo "Error: Usage: make show-accounts PROGRAM=<program_name>" >&2; \
		exit 1; \
	fi
	@echo "Showing accounts for program [$(PROGRAM)] on $(CLUSTER)..."
	@solana program show --programs $(PROGRAM_ID) --url $(RPC_URL)

# --- Help ---

help: ## Display this help screen.
	@echo "Usage: make <command> [OPTIONS]"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make setup                    # Initial project setup"
	@echo "  make build                   # Build all programs"
	@echo "  make test                    # Run all tests"
	@echo "  make deploy PROGRAM=shenqi-box CLUSTER=devnet"
	@echo "  make start-localnet          # Start local validator"
	@echo "  make check-cluster           # Show current configuration"
