VERSION=$(shell grep \"version\" manifest.json  | cut -d\" -f 4)

zip: clean
	zip --recurse-paths open-links-in-tabs-$(VERSION).zip . \
		--exclude './open-links-in-tabs.pem' \
		--exclude '*.git*' \
		--exclude '*~*'

local:
	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=$(PWD) --pack-extension-key=$(PEM_FILE)

clean:
	rm -vf open-links-in-tabs-$(VERSION).zip
