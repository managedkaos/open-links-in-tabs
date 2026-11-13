VERSION=$(shell grep \"version\" manifest.json  | cut -d\" -f 4)
PACKAGE=open-links-in-tabs-$(VERSION)

help: ## Display available targets
	@awk 'BEGIN {FS = ":.*## "}; /^[a-zA-Z0-9_-]+:.*## / {printf "\033[36m%-28s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

all: test clean zip tar pack ## Test and build all extension packages

test: ## Run the popup test suite
	cat test_urls.txt
	npm test

ci: ## Install dependencies from the lockfile
	npm ci

zip: ## Create a ZIP archive of committed source
tar: ## Create a tar archive of committed source

zip tar:
	rm -vf /tmp/$(PACKAGE).$(@)
	git archive \
		--format=$(@) \
		--prefix="$(PACKAGE)/" \
		HEAD > /tmp/$(PACKAGE).$(@)

pack: tar ## Pack the extension with Chrome and PEM_FILE
	tar -xf /tmp/$(PACKAGE).tar -C /tmp
	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
		--pack-extension=/tmp/$(PACKAGE) \
		--pack-extension-key=$(PEM_FILE)

clean: ## Remove generated extension packages
	rm -rvf /tmp/$(PACKAGE) \
		/tmp/$(PACKAGE).tar \
		/tmp/$(PACKAGE).zip \
		/tmp/$(PACKAGE).crx

.PHONY: help all test ci zip tar pack clean
