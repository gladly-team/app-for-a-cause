# App for a Cause - Makefile
# Ionic React + Capacitor project

.PHONY: help install start build test lint clean \
        sync assets \
        ios-open ios-build ios-run ios-sim ios-logs \
        android-open android-build android-run \
        version-check

# iOS simulator device — override with: make ios-sim IOS_SIM="iPhone 16"
IOS_SIM ?= iPhone 16 Pro

# Default target
help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Development:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# -------------------------------------------------------------------
# Development
# -------------------------------------------------------------------

install: ## Install npm dependencies
	npm install

start: ## Start the development server
	npm start

build: ## Build the web project
	npm run build

test: ## Run tests
	npm test

lint: ## Lint the codebase
	npm run lint

clean: ## Remove build artifacts and node_modules
	rm -rf build node_modules

# -------------------------------------------------------------------
# Capacitor
# -------------------------------------------------------------------

sync: build ## Build and sync web code to native platforms
	npx cap sync

assets: ## Generate splash screens and icons from assets/
	npx capacitor-assets generate

# -------------------------------------------------------------------
# iOS
# -------------------------------------------------------------------

ios-open: ## Open the iOS project in Xcode
	npx cap open ios

ios-build: build ## Build web and sync to iOS
	npx cap sync ios

ios-run: ios-build ## Build, sync, and run on a connected iOS device
	npx cap run ios --target device

ios-sim: ios-build ## Build, sync, and run in the iOS Simulator (default: iPhone 16 Pro)
	$(eval SIM_ID := $(shell xcrun simctl list devices available | grep "$(IOS_SIM)" | head -1 | grep -oE '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}'))
	@if [ -z "$(SIM_ID)" ]; then echo "Error: No simulator found matching '$(IOS_SIM)'. Run 'make ios-sim-list' to see available devices."; exit 1; fi
	@xcrun simctl boot $(SIM_ID) 2>/dev/null || true
	npx cap run ios --target "$(SIM_ID)"

ios-sim-list: ## List available iOS simulators
	xcrun simctl list devices available | grep -E "(iPhone|iPad)"

ios-logs: ## Stream app console logs from the running iOS Simulator
	@xcrun simctl terminate booted io.gladly.appforacause 2>/dev/null || true
	@sleep 1
	xcrun simctl launch --console booted io.gladly.appforacause

# -------------------------------------------------------------------
# Android
# -------------------------------------------------------------------

android-open: ## Open the Android project in Android Studio
	npx cap open android

android-build: build ## Build web and sync to Android
	npx cap sync android

android-run: android-build ## Build, sync, and run on a connected Android device/emulator
	npx cap run android

# -------------------------------------------------------------------
# Utilities
# -------------------------------------------------------------------

version-check: ## Show current version numbers across all platforms
	@echo "=== package.json ==="
	@node -e "console.log(require('./package.json').version)"
	@echo ""
	@echo "=== iOS (MARKETING_VERSION) ==="
	@grep -m1 'MARKETING_VERSION' ios/App/App.xcodeproj/project.pbxproj | awk '{print $$NF}' | tr -d ';'
	@echo ""
	@echo "=== iOS (CURRENT_PROJECT_VERSION) ==="
	@grep -m1 'CURRENT_PROJECT_VERSION' ios/App/App.xcodeproj/project.pbxproj | awk '{print $$NF}' | tr -d ';'
	@echo ""
	@echo "=== Android (versionName) ==="
	@grep 'versionName' android/app/build.gradle | awk '{print $$2}' | tr -d '"'
	@echo ""
	@echo "=== Android (versionCode) ==="
	@grep 'versionCode' android/app/build.gradle | awk '{print $$2}'
