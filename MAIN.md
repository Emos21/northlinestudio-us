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

## DNS (Hostnali DNS Manager, zone for northlinestudio.us)
Domain nameservers: `ns1.hostnali.net` and `ns2.hostnali.net` (Hostnali default).
Edit records at clients.hostnali.com > Domains > northlinestudio.us > DNS Manager.
The old custom nameservers `ns30/ns40` refuse this zone: do not switch back to them.

| Type  | Host | Value                    |
|-------|------|--------------------------|
| A     | @    | 185.199.108.153          |
| A     | @    | 185.199.109.153          |
| A     | @    | 185.199.110.153          |
| A     | @    | 185.199.111.153          |
| CNAME | www  | emos21.github.io         |

No MX records yet: mail to info@northlinestudio.us bounces until email is set up.
Keep any MX and TXT records added later; do not add AAAA or other A/CNAME records on `@`/`www`.

## HTTPS
Certificate is issued by GitHub (Let's Encrypt) and Enforce HTTPS is on (state on 2026-11-12:
approved, expires 2027-02-10). If the Pages settings page sits at "DNS Check in Progress" for
more than about an hour, remove the custom domain and add it back (API: PUT
repos/Emos21/northlinestudio-us/pages with cname null, then cname northlinestudio.us). GitHub
commits "Delete CNAME" and "Create CNAME" to `main` when you do this: pull before committing.

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
