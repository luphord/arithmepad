#!/bin/sh
civetweb -document_root . -extra_mime_types .appcache=text/cache-manifest
