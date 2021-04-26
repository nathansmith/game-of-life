# ============
# MINIFY HTML.
# ============

html-minifier \
--input-dir './html' \
--output-dir './html' \
--file-ext 'html' \
--collapse-whitespace \
--decode-entities \
--minify-css true \
--minify-js true \
--remove-comments \
--remove-redundant-attributes \
--remove-script-type-attributes \
--remove-style-link-type-attributes \
--use-short-doctype

# ===========
# MINIFY CSS.
# ===========

purgecss \
--config './purgecss.config.js' \
--output './html/assets'
