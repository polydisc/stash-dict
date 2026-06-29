# Dictionary App

An offline iPhone dictionary app (React Native / Expo) that lets users import
and search their own StarDict — and later PDIC — dictionaries.

## Language

**Dictionary**:
One imported dictionary source: a StarDict file set (`.ifo`/`.idx`/`.dict`/`.syn`)
that the user has loaded into the app. Identified internally by a `dictId`.
_Avoid_: book, dict file, source

**Headword**:
The lookup key of an entry — the word or phrase a user searches for.
_Avoid_: term, key, word

**Article**:
The definition body associated with a headword — the displayed content (plain
text or HTML). One headword maps to one or more articles.
_Avoid_: definition, body, gloss, meaning

**Entry**:
The pairing of a headword with its article(s). The unit stored as a row.
_Avoid_: record, item

**Synonym**:
An alternate headword (from a StarDict `.syn` file) that resolves to an existing
entry's article rather than having its own article.
_Avoid_: alias, alternate

**Search history**:
A time-ordered record of headwords the user has actually opened (not every
keystroke of incremental search). Tracked per headword, newest first, with
repeats collapsed to the most recent.
_Avoid_: recents, log

**Favorite**:
A headword the user has explicitly saved for later — the app's word list /
vocabulary book. Stored per headword, not tied to a specific dictionary's entry,
so it survives dictionaries being disabled or removed.
_Avoid_: bookmark, saved word, star

**Enabled**:
Whether a dictionary participates in search. Disabled dictionaries keep their
data but are excluded from lookups.

**Order**:
The user-defined sequence of dictionaries, used as the section order when a
search spans multiple dictionaries.
_Avoid_: priority, rank
