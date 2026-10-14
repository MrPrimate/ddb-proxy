# 0.0.26

* Class spell lists honour the `rulesVersion` sent by ddb-importer, adding the 2024 class lists (including Artificer and Magus). Previously a 2024 request returned the 2014 list, or "Invalid query" for 2024-only classes such as the Magus.
* Add `/proxy/user-data`, used by the ddb-importer debug tool.
* Docker image now uses Node 24 on Alpine 3.24 and builds from the checked out source rather than cloning the repository. Images are published for `linux/amd64` and `linux/arm64`; 32-bit ARM is dropped as Node 24 has no 32-bit ARM Alpine image.
* Requires Node 20.19 or newer. Dependencies updated (Express 5, ESLint 10 flat config, Prettier 3); `node-fetch` replaced by Node's built-in `fetch`.

# 0.0.25

* Fetch Custom Items for Characters

# 0.0.24

* Aggressive Campaign caching

# 0.0.22/ 0.2.23

* Some custom spells would not be fetched, depending on how they were attached to characters like the Druid.

# 0.0.21

* If using Tasha's optional spell lists for a sorcerer, with a prepared spell casting class, the spells would be added to the Paladin known spells.

# 0.0.20

* `isHomebrew` spell parsing bug for feat granted spells

# 0.0.19

* Prevent legacy checkbox excluding homebrew.
* If homebrew was disabled on the character, it would still add homebrew spells to the characters available selection.

# 0.0.18

* Some more clauses to try and stop issue #18 when it can't find a cobalt.

# 0.0.17

* Exclude legacy monsters option.

# 0.0.16

* Add missing config URL.

# 0.0.15

* DDB Config fetch

# 0.0.14

* `/ping` endpoint

# 0.0.13

* Typo meant some monster image urls had double .com in them.

# 0.0.12

* MonsterBy ID API failed

# 0.0.10

* ARM support

# 0.0.7

* API change for campaigns backend.

# 0.0.6

* Correct monster images

# 0.0.5

* Support v5 API, compatible with ddb-importer v2.3.2 and greater.

# 0.0.4

* Docker release.

# 0.0.3

* Endpoint for fetching campaigns.

# 0.0.2

* Auth endpoint added for ddb-importer 2.1.6 support
