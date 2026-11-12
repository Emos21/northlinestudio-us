# northlinestudio-us: ops record

## What lives where
- Site: https://northlinestudio.us/ (GitHub Pages, static)
- Repo: https://github.com/Emos21/northlinestudio-us (public), branch `main`, folder `/`
- Local copy: `~/Desktop/northlinestudio-us`
- Registrar and DNS: Hostnali (https://clients.hostnali.com), domain expires 2027-07-10.
  Login is Amos's own session in the browser. No credentials are stored here.
- GitHub auth: `gh` keyring, account `Emos21`.

## Run locally
    cd ~/Desktop/northlinestudio-us
    python3 -m http.server 8765 --bind 127.0.0.1
    open http://127.0.0.1:8765/

## Test
    tests/check.sh        # must print ALL PASS before every push

## Deploy
Push to `main`. Pages rebuilds in about a minute.

    git push origin main

## DNS (set at Hostnali, zone for northlinestudio.us)
| Type  | Host | Value                    |
|-------|------|--------------------------|
| A     | @    | 185.199.108.153          |
| A     | @    | 185.199.109.153          |
| A     | @    | 185.199.110.153          |
| A     | @    | 185.199.111.153          |
| CNAME | www  | emos21.github.io         |

Remove any other A, AAAA or CNAME records on `@` and `www`. Keep MX and TXT
records (email for info@northlinestudio.us depends on them).
After DNS resolves: repo Settings > Pages > tick Enforce HTTPS.

## How the static site was made
The original was PHP. `tools/convert.sh <source-dir>` renders each page with PHP CLI,
rewrites `.php` links to `.html` and copies the assets. It copies only the pages and
asset folders named in the script. Future edits go straight into the HTML and CSS in
this repo; do not re-run convert.sh over edits.

Two server features became client-side (`assets/js/static-forms.js`):
- Enquiry form: opens a WhatsApp message with the fields filled in (was PHP `mail()`).
- `?src=G4` attribution: tags every WhatsApp first message with `(G4)`.

Not carried over: `.htaccess` redirects and caching. The footer year is fixed at the
build year. The footer newsletter box is cosmetic (never sent anywhere).
Old `.php` URLs are caught by `404.html`, which forwards them to the `.html` page.

## Current state
See `logfile.md`.
