# DEPRECATION NOTICE
As of 2022, there is [JupyterLite](https://jupyterlite.readthedocs.io/en/latest/) and [Pyodide](https://github.com/pyodide/pyodide),
which give you a fully browser-based, backend-free scientific computing environment with tons of great packages available.
There is no more need for lowtech **arithmepad**, hence it is now **deprecated**.

# arithmepad

arithmepad is a JavaScript based web notebook than runs entirely in the
browser. There is no server side component. Look and feel as well as
behaviour has been heavily inspired and shamelessly copied from
[Jupyter Notebooks](https://jupyter.org/). Feel free to check out the hosted version on [arithmepad.vercel.app](https://arithmepad.vercel.app)
or one of these examples:

* [Geometric Brownian Motion](https://arithmepad.vercel.app/#Ly8gIWFyaXRobWVwYWQtcHJvcGVydGllcyB7InRpdGxlIjoiR2VvbWV0cmljIEJyb3duaWFuIE1vdGlvbiBFeGFtcGxlIn0KLy8gIWFyaXRobWVwYWQtY2VsbCB7ImNlbGxUeXBlIjoibWFya2Rvd24iLCJzaG93TGluZU51bWJlcnMiOmZhbHNlfQovLyAjIEdlb21ldHJpYyBCcm93bmlhbiBNb3Rpb24gRXhhbXBsZQovLyAtIGRlZmluZXMgcGFyYW1ldGVycyBtdSBhbmQgc2lnbWEKLy8gLSBzaW11bGF0ZXMgYSBHZW9tZXRyaWMgQnJvd25pYW4gTW90aW9uIChHQk0pIHVzaW5nIHRoZXNlIHBhcmFtZXRlcnMKLy8gLSBwbG90cyBhbGwgc2ltdWxhdGVkIHBhdGhzCi8vIAovLyAhYXJpdGhtZXBhZC1jZWxsIHsiY2VsbFR5cGUiOiJqcyIsInNob3dMaW5lTnVtYmVycyI6ZmFsc2V9Cm11ID0gMC4wODsKc2lnbWEgPSAwLjI7Ci8vICFhcml0aG1lcGFkLWNlbGwgeyJjZWxsVHlwZSI6ImpzIiwic2hvd0xpbmVOdW1iZXJzIjpmYWxzZX0Kbj0zOwpUPTIwOwoKeCA9IF8oXy5yYW5nZShuKSkubWFwKCgpID0+IG5ldyBBcnJheShUKSk7Cgpmb3IgKHZhciBpPTA7IGk8bjsgaSsrKSB7CiAgZm9yICh2YXIgdD0wOyB0PFQ7IHQrKykgewogICAgeFtpXVt0XSA9IE1hdGgucmFuZG9tKCk7CiAgfQp9Ci8vICFhcml0aG1lcGFkLWNlbGwgeyJjZWxsVHlwZSI6ImpzIiwic2hvd0xpbmVOdW1iZXJzIjpmYWxzZX0KZGF0YSA9IHtsYWJlbHM6IF8ucmFuZ2UoVCksIHNlcmllczogeH07Cm5ldyBDaGFydGlzdC5MaW5lKHBsb3RJZCwgZGF0YSk7)
* [Binomial Model](https://arithmepad.vercel.app/#Ly8gIWFyaXRobWVwYWQtcHJvcGVydGllcyB7InRpdGxlIjoiQmlub21pYWwgTW9kZWwifQovLyAhYXJpdGhtZXBhZC1jZWxsIHsiY2VsbFR5cGUiOiJtYXJrZG93biIsInNob3dMaW5lTnVtYmVycyI6ZmFsc2V9Ci8vICMgVGhlIEJpbm9taWFsIE1vZGVsCi8vICFhcml0aG1lcGFkLWNlbGwgeyJjZWxsVHlwZSI6Im1hcmtkb3duIiwic2hvd0xpbmVOdW1iZXJzIjpmYWxzZX0KLy8gU2V0dGluZyB1cCBzb21lIHBhcmFtZXRlcnMuCi8vICFhcml0aG1lcGFkLWNlbGwgeyJjZWxsVHlwZSI6ImpzIiwic2hvd0xpbmVOdW1iZXJzIjp0cnVlfQp1ID0gMS4yOwpkID0gMC44OwpyID0gMC4wMTsKUzAgPSAxMDA7CksgPSAxMjA7ClQgPSAxMDsKbnMgPSBfLnJhbmdlKFQrMSk7Ci8vICFhcml0aG1lcGFkLWNlbGwgeyJjZWxsVHlwZSI6ImpzIiwic2hvd0xpbmVOdW1iZXJzIjp0cnVlfQpmYWMgPSBmdW5jdGlvbihuKSB7CiAgdmFyIHJlcyA9IDE7CiAgZm9yICh2YXIgaT0yOyBpPD1uOyBpKyspCiAgICByZXMgKj0gaTsKICByZXR1cm4gcmVzOwp9OwpjaG9vc2UgPSAobiwgaykgPT4gZmFjKG4pIC8gKGZhYyhrKSAqIGZhYyhuLWspKTsKLy8gIWFyaXRobWVwYWQtY2VsbCB7ImNlbGxUeXBlIjoianMiLCJzaG93TGluZU51bWJlcnMiOnRydWV9Ci8vIHNldCB1cCB0cmVlCnEgPSAoMSArIHIgLSBkKSAvICh1IC0gZCk7Cm5FbnRyaWVzID0gKFQrMSkqKFQrMikvMjsKdHJlZSA9IHsKICBTOiBuZXcgRmxvYXQ2NEFycmF5KG5FbnRyaWVzKSwKICBROiBuZXcgRmxvYXQ2NEFycmF5KG5FbnRyaWVzKSwKfTsKaWR4ID0gZnVuY3Rpb24odCwgbikgewogIGlmIChuID4gdCkgewogICAgdGhyb3cgKCduPScgKyBuICsgJyA+ICcgKyB0ICsgJz10OiBuIGNhbm5vdCBiZSBsYXJnZXIgdGhhbiB0IScpOwogIH0KICByZXR1cm4gKHQrMSkqdC8yK247Cn07CmZvciAodmFyIHQ9MDsgdDw9VDsgdCsrKSB7CiAgZm9yICh2YXIgbj0wOyBuPD10OyBuKyspIHsKICAgIHRyZWUuU1tpZHgodCxuKV0gPSBTMCAqIE1hdGgucG93KHUsIG4pICogTWF0aC5wb3coZCwgdC1uKTsKICAgIHRyZWUuUVtpZHgodCxuKV0gPSBjaG9vc2UodCwgbikgKiBNYXRoLnBvdyhxLCBuKSAqIE1hdGgucG93KDEtcSwgdC1uKTsKICB9Cn0KbkVudHJpZXMKLy8gIWFyaXRobWVwYWQtY2VsbCB7ImNlbGxUeXBlIjoianMiLCJzaG93TGluZU51bWJlcnMiOnRydWV9Ci8vIHBsb3QgdGhlIHRyZWUKdmFyIGxhc3RfdmFsdWVzID0gW1MwXTsKc2VyaWVzID0gW107CmZvciAodmFyIHQ9MDsgdDxUOyB0KyspIHsKICBuZXdfdmFsdWVzID0gW107CiAgZm9yICh2YXIgbj0wOyBuPGxhc3RfdmFsdWVzLmxlbmd0aDsgbisrKSB7CiAgICBuZXdfdmFsdWVzLnB1c2gobGFzdF92YWx1ZXNbbl0qdSk7CiAgICBzZXJpZXMucHVzaChbe3g6IHQsIHk6IGxhc3RfdmFsdWVzW25dfSwge3g6IHQrMSwgeTogbGFzdF92YWx1ZXNbbl0qdX1dKTsKICAgIHNlcmllcy5wdXNoKFt7eDogdCwgeTogbGFzdF92YWx1ZXNbbl19LCB7eDogdCsxLCB5OiBsYXN0X3ZhbHVlc1tuXSpkfV0pOwogIH0KICBuZXdfdmFsdWVzLnB1c2gobGFzdF92YWx1ZXNbbi0xXSpkKTsKICBsYXN0X3ZhbHVlcyA9IG5ld192YWx1ZXM7Cn0KbmV3IENoYXJ0aXN0LkxpbmUocGxvdElkLCB7CiAgbGFiZWxzOiBucywKICBzZXJpZXM6IHNlcmllcywKICBjb2xvcnM6IFsnYmx1ZSddCn0sIHsKICBheGlzWDoge3R5cGU6IENoYXJ0aXN0LkF1dG9TY2FsZUF4aXN9LAogIGhlaWdodDogMzAwCn0pCi5vbignZHJhdycsIGZ1bmN0aW9uKGNvbnRleHQpIHsKICBpZiAoY29udGV4dC50eXBlID09PSAnbGluZScpIHsKICAgIGNvbnRleHQuZWxlbWVudC5hdHRyKHsKICAgICAgc3R5bGU6ICdzdHJva2U6IGJsdWU7IHN0cm9rZS13aWR0aDogMXB4JwogICAgfSk7CiAgfQogIGlmIChjb250ZXh0LnR5cGUgPT09ICdwb2ludCcpIHsKICAgIGNvbnRleHQuZWxlbWVudC5hdHRyKHsKICAgICAgc3R5bGU6ICdzdHJva2U6IGJsdWU7IHN0cm9rZS13aWR0aDogNHB4JwogICAgfSk7CiAgfQp9KTsKLy8gIWFyaXRobWVwYWQtY2VsbCB7ImNlbGxUeXBlIjoianMiLCJzaG93TGluZU51bWJlcnMiOnRydWV9Ci8vIHBsb3QgdGhlIHRlcm1pbmFsIHZhbHVlcyBvZiB0aGUgdW5kZXJseWluZwpTID0gKHQsIG4pID0+IHRyZWUuU1tpZHgodCwgbildOy8vUzAgKiBNYXRoLnBvdyh1LCBuKSAqIE1hdGgucG93KGQsIHQtbik7CgpuZXcgQ2hhcnRpc3QuTGluZShwbG90SWQsIHsKICBsYWJlbHM6IG5zLAogIHNlcmllczogW18obnMpLm1hcChuID0+IFMoVCwgbikpXQp9LCB7aGVpZ2h0OiAzMDB9KTsKLy8gIWFyaXRobWVwYWQtY2VsbCB7ImNlbGxUeXBlIjoianMiLCJzaG93TGluZU51bWJlcnMiOnRydWV9Ci8vIHBsb3QgdGhlIHRlcm1pbmFsIGRpc3RyaWJ1dGlvbiBvZiB0aGUgcmlzayBuZXV0cmFsIG1lYXN1cmUKUSA9ICh0LCBuKSA9PiB0cmVlLlFbaWR4KHQsIG4pXTsvL2Nob29zZSh0LCBuKSAqIE1hdGgucG93KHEsIG4pICogTWF0aC5wb3cocSwgdC1uKTsKCm5ldyBDaGFydGlzdC5CYXIocGxvdElkLCB7CiAgbGFiZWxzOiBfKG5zKS5tYXAobiA9PiBNYXRoLnJvdW5kKFMoVCwgbikpKSwKICBzZXJpZXM6IFtfKG5zKS5tYXAobiA9PiAoe3g6IFMoVCwgbiksIHk6IFEoVCwgbil9KSldCn0sIHsKICBheGlzWDoge3R5cGU6IENoYXJ0aXN0LkF1dG9TY2FsZUF4aXN9LAogIGhlaWdodDogMzAwCn0pOwovLyAhYXJpdGhtZXBhZC1jZWxsIHsiY2VsbFR5cGUiOiJqcyIsInNob3dMaW5lTnVtYmVycyI6dHJ1ZX0KLy8gcGxvdCB0aGUgdGVybWluYWwgdmFsdWVzIG9mIHRoZSB1bmRlcmx5aW5nCnBheW9mZiA9IChzKSA9PiBNYXRoLm1heChzIC0gSywgMCk7CgpuZXcgQ2hhcnRpc3QuTGluZShwbG90SWQsIHsKICBsYWJlbHM6IF8obnMpLm1hcChuID0+IE1hdGgucm91bmQoUyhULCBuKSkpLAogIHNlcmllczogW18obnMpLm1hcChuID0+ICh7eDogUyhULCBuKSwgeTogcGF5b2ZmKFMoVCwgbikpfSkpXQp9LCB7CiAgYXhpc1g6IHt0eXBlOiBDaGFydGlzdC5BdXRvU2NhbGVBeGlzfSwKICBsaW5lU21vb3RoOiBmYWxzZSwKICBoZWlnaHQ6IDMwMAp9KTsKLy8gIWFyaXRobWVwYWQtY2VsbCB7ImNlbGxUeXBlIjoianMiLCJzaG93TGluZU51bWJlcnMiOnRydWV9Cm5wdiA9IE1hdGgucG93KDErciwgLVQpICogbnVtZXJpYy5zdW0oIF8obnMpLm1hcChuID0+IHBheW9mZihTKFQsIG4pKSAqIFEoVCxuKSkgKTs=)

## Screenshots

#### Rename current pad
![Rename current pad](screenshots/screenshot1.jpg "Rename current pad")

#### Using menus and buttons
![Using menus and buttons](screenshots/screenshot2.jpg "Using menus and buttons")

#### Plot example
![Plot example](screenshots/screenshot3.jpg "Plot example")

## Install / Usage

Simply put the content of this repo (at least `index.html` and the `assets` + `vendor` folder) on a static web server and open the page in your browser. There is no server-side code required, everything runs inside the browser.

Pads (i.e. notebooks) can be downloaded to files (and uploaded back). For some example pads, see the `examples` folder.

## History

### Deprecation in 2022
Like a phoenix from the ashes of [Iodide](https://github.com/iodide-project/iodide), the [Pyodide](https://github.com/pyodide/pyodide) project has risen.
Combined with [JupyterLite](https://jupyterlite.readthedocs.io/en/latest/) this finally gives a fully browser-based, backend-free scientific computing environment
with tons of great packages available.
This makes arithmepad superfluous to me, hence it is now deprecated.

### v0.1.4 (not yet)
* Add favicon
* Add web app manifest (first steps towards PWA)

### v0.1.3 (2020-07-31)
* Fix adding cells on clear pad (button did not work)
* Run continuous tests with [Travis CI](https://travis-ci.com/github/luphord/arithmepad)
* Disable worker (which cannot be run from file://)
* Disable Ace snippets (which are not included anyway)
* Remove source maps to prevent warnings

### v0.1.2 (2020-07-28)
* Improve initial example content
* Add link to GitHub project (in `About` menu)
* Host on [arithmepad.vercel.app](https://arithmepad.vercel.app)

### v0.1.1 (2020-06-07)
* Move all vendored dependencies to the `vendor` folder

### v0.1.0 (2020-06-07)
* Release of the code mostly as imported from fossil 2015

### Restart in 2020
In need of a simple way to give potential users a tool to experiment with [gaussian-analytics.js](https://github.com/luphord/gaussian-analytics)
I was looking for JavaScript web notebook. [Iodide](https://github.com/iodide-project/iodide) was still in alpha
and there seemed to be no easy way to self-host it on a static server. Also, I could not find any
other promising alternatives. arithmepad in contrast gave me all the features I required
but loading JavaScript examples by URL. So I decided to restart the project in June 2020.

### Deprecation in 2019
Not having worked on arithmepad for more than three years, I decided to deprecate
the project in early 2019. I considered [Iodide](https://github.com/iodide-project/iodide)
as an alternative, which was actively maintained and of far better quality than arithmepad
ever could be.

### Development in 2015
arithmepad was developed to have a web based JavaScript notebook for the browser.
It was meant to be simple, both in usage as well as in hosting (no requirements
but a static web server) at the expense of more advanced features.