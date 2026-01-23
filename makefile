.PHONY: help
SHELL := /bin/bash

# The default target will display help
help:
	@echo "Available targets:"
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo

install: ## Install the project
	pnpm install

start: ## Run the project in development mode
	pnpm dev

build: ## Build the project
	pnpm build

lint: ## Lint the project
	pnpm lint

test: ## Test the project
	pnpm test