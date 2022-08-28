VERSION=$(shell grep \"version\" manifest.json  | cut -d\" -f 4)

zip: clean
	zip --recurse-paths open-links-in-tabs-$(VERSION).zip . \
		--exclude './open-links-in-tabs.pem' \
		--exclude '*.git*' \
		--exclude '*~*'

clean:
	rm -vf open-links-in-tabs-$(VERSION).zip
