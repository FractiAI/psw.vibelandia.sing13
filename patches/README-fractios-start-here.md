# FractiOS · Start Here UI patch

This agent seat could not push to `FractiAI/FractiOS` (write token scope is SING13-only / expired).

Apply on a FractiOS clone:

```bash
cd /path/to/FractiOS
git am ../psw.vibelandia.sing13/patches/fractios-start-here-ui.patch
# or: git apply ../psw.vibelandia.sing13/patches/fractios-start-here-ui.patch
git push
```

Adds `interfaces/start-here.html`, serves `GET /start-here`, links from operator console + START_HERE.md.
SING 13 mirror already ships at `/fractios/start-here`.
