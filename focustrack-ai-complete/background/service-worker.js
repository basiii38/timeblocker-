// FocusTrack AI - Complete Service Worker with ALL features
console.log('FocusTrack AI Complete: Starting...');

const CATEGORIES = {
  PRODUCTIVE: 'productive',
  NEUTRAL: 'neutral',
  DISTRACTING: 'distracting',
  UNCATEGORIZED: 'uncategorized'
};

const DEFAULT_CATEGORIES = {
  // PRODUCTIVE SITES (Development, Education, Business, Productivity)
  // Developer Tools & Documentation
  'github.com': 'productive', 'stackoverflow.com': 'productive', 'stackexchange.com': 'productive',
  'gitlab.com': 'productive', 'bitbucket.org': 'productive', 'codepen.io': 'productive',
  'jsfiddle.net': 'productive', 'repl.it': 'productive', 'replit.com': 'productive',
  'glitch.com': 'productive', 'codesandbox.io': 'productive', 'jsbin.com': 'productive',
  'developer.mozilla.org': 'productive', 'docs.microsoft.com': 'productive', 'docs.python.org': 'productive',
  'docs.oracle.com': 'productive', 'dev.java': 'productive', 'golang.org': 'productive',
  'kotlinlang.org': 'productive', 'rust-lang.org': 'productive', 'ruby-doc.org': 'productive',
  'docs.ruby-lang.org': 'productive', 'php.net': 'productive', 'nodejs.org': 'productive',
  'reactjs.org': 'productive', 'react.dev': 'productive', 'vuejs.org': 'productive',
  'angular.io': 'productive', 'svelte.dev': 'productive', 'nextjs.org': 'productive',
  'nuxt.com': 'productive', 'webpack.js.org': 'productive', 'vitejs.dev': 'productive',
  'npmjs.com': 'productive', 'yarnpkg.com': 'productive', 'pypi.org': 'productive',
  'packagist.org': 'productive', 'rubygems.org': 'productive', 'crates.io': 'productive',
  'maven.apache.org': 'productive', 'gradle.org': 'productive', 'docker.com': 'productive',
  'kubernetes.io': 'productive', 'terraform.io': 'productive', 'ansible.com': 'productive',
  'jenkins.io': 'productive', 'circleci.com': 'productive', 'travis-ci.org': 'productive',
  'aws.amazon.com': 'productive', 'cloud.google.com': 'productive', 'azure.microsoft.com': 'productive',
  'heroku.com': 'productive', 'vercel.com': 'productive', 'netlify.com': 'productive',
  'digitalocean.com': 'productive', 'linode.com': 'productive', 'vultr.com': 'productive',
  'laravel.com': 'productive', 'symfony.com': 'productive', 'django.readthedocs.io': 'productive',
  'flask.palletsprojects.com': 'productive', 'expressjs.com': 'productive', 'nestjs.com': 'productive',
  'spring.io': 'productive', 'strapi.io': 'productive', 'graphql.org': 'productive',
  'apollographql.com': 'productive', 'prisma.io': 'productive', 'sequelize.org': 'productive',
  'mongodb.com': 'productive', 'postgresql.org': 'productive', 'mysql.com': 'productive',
  'redis.io': 'productive', 'elasticsearch.org': 'productive', 'firebase.google.com': 'productive',
  'supabase.com': 'productive', 'planetscale.com': 'productive', 'railway.app': 'productive',
  'render.com': 'productive', 'fly.io': 'productive', 'cloudflare.com': 'productive',

  // Design & Creative Tools
  'figma.com': 'productive', 'sketch.com': 'productive', 'adobe.com': 'productive',
  'canva.com': 'productive', 'dribbble.com': 'productive', 'behance.net': 'productive',
  'invisionapp.com': 'productive', 'framer.com': 'productive', 'webflow.com': 'productive',
  'miro.com': 'productive', 'mural.co': 'productive', 'whimsical.com': 'productive',
  'lucidchart.com': 'productive', 'draw.io': 'productive', 'excalidraw.com': 'productive',
  'photopea.com': 'productive', 'pixlr.com': 'productive', 'remove.bg': 'productive',
  'tinypng.com': 'productive', 'squoosh.app': 'productive', 'colorhunt.co': 'productive',
  'coolors.co': 'productive', 'paletton.com': 'productive', 'materialpalette.com': 'productive',
  'fontawesome.com': 'productive', 'fonts.google.com': 'productive', 'dafont.com': 'productive',

  // Productivity & Organization
  'notion.so': 'productive', 'evernote.com': 'productive', 'onenote.com': 'productive',
  'roamresearch.com': 'productive', 'obsidian.md': 'productive', 'logseq.com': 'productive',
  'todoist.com': 'productive', 'any.do': 'productive', 'habitica.com': 'productive',
  'trello.com': 'productive', 'asana.com': 'productive', 'monday.com': 'productive',
  'clickup.com': 'productive', 'airtable.com': 'productive', 'basecamp.com': 'productive',
  'jira.atlassian.com': 'productive', 'confluence.atlassian.com': 'productive', 'linear.app': 'productive',
  'height.app': 'productive', 'notion.so': 'productive', 'coda.io': 'productive',
  'slite.com': 'productive', 'nuclino.com': 'productive', 'guru.com': 'productive',
  'zapier.com': 'productive', 'ifttt.com': 'productive', 'make.com': 'productive',
  'n8n.io': 'productive', 'automate.io': 'productive', 'integromat.com': 'productive',

  // Learning & Education
  'coursera.org': 'productive', 'udemy.com': 'productive', 'udacity.com': 'productive',
  'edx.org': 'productive', 'khanacademy.org': 'productive', 'codecademy.com': 'productive',
  'freecodecamp.org': 'productive', 'theodinproject.com': 'productive', 'w3schools.com': 'productive',
  'tutorialspoint.com': 'productive', 'javatpoint.com': 'productive', 'geeksforgeeks.org': 'productive',
  'leetcode.com': 'productive', 'hackerrank.com': 'productive', 'codewars.com': 'productive',
  'exercism.org': 'productive', 'codingame.com': 'productive', 'topcoder.com': 'productive',
  'codeforces.com': 'productive', 'atcoder.jp': 'productive', 'projecteuler.net': 'productive',
  'brilliant.org': 'productive', 'skillshare.com': 'productive', 'masterclass.com': 'productive',
  'pluralsight.com': 'productive', 'lynda.com': 'productive', 'linkedin.com/learning': 'productive',
  'datacamp.com': 'productive', 'kaggle.com': 'productive', 'medium.com': 'productive',
  'dev.to': 'productive', 'hashnode.com': 'productive', 'daily.dev': 'productive',
  'hackernoon.com': 'productive', 'css-tricks.com': 'productive', 'smashingmagazine.com': 'productive',
  'a11yproject.com': 'productive', 'web.dev': 'productive', 'javascript.info': 'productive',
  'eloquentjavascript.net': 'productive', 'learnxinyminutes.com': 'productive', 'devdocs.io': 'productive',
  'cheatography.com': 'productive', 'quickref.me': 'productive', 'overapi.com': 'productive',

  // Professional & Career
  'linkedin.com': 'productive', 'glassdoor.com': 'productive', 'indeed.com': 'productive',
  'monster.com': 'productive', 'careerbuilder.com': 'productive', 'ziprecruiter.com': 'productive',
  'dice.com': 'productive', 'angellist.com': 'productive', 'wellfound.com': 'productive',
  'hired.com': 'productive', 'triplebyte.com': 'productive', 'hackerrank.com/jobs': 'productive',
  'remotely.com': 'productive', 'weworkremotely.com': 'productive', 'remote.co': 'productive',
  'flexjobs.com': 'productive', 'upwork.com': 'productive', 'fiverr.com': 'productive',
  'freelancer.com': 'productive', 'toptal.com': 'productive', 'guru.com': 'productive',
  '99designs.com': 'productive', 'peopleperhour.com': 'productive', 'workana.com': 'productive',

  // Research & Academic
  'scholar.google.com': 'productive', 'researchgate.net': 'productive', 'academia.edu': 'productive',
  'arxiv.org': 'productive', 'pubmed.ncbi.nlm.nih.gov': 'productive', 'sciencedirect.com': 'productive',
  'jstor.org': 'productive', 'ieee.org': 'productive', 'acm.org': 'productive',
  'springer.com': 'productive', 'nature.com': 'productive', 'science.org': 'productive',
  'plos.org': 'productive', 'wiley.com': 'productive', 'elsevier.com': 'productive',
  'mendeley.com': 'productive', 'zotero.org': 'productive', 'paperpile.com': 'productive',
  'citethisforme.com': 'productive', 'easybib.com': 'productive', 'grammarly.com': 'productive',
  'hemingwayapp.com': 'productive', 'writefull.com': 'productive', 'languagetool.org': 'productive',
  'overleaf.com': 'productive', 'sharelatex.com': 'productive', 'latexbase.com': 'productive',

  // Communication & Collaboration (Work)
  'slack.com': 'productive', 'discord.gg': 'productive', 'teams.microsoft.com': 'productive',
  'zoom.us': 'productive', 'meet.google.com': 'productive', 'webex.com': 'productive',
  'gotomeeting.com': 'productive', 'whereby.com': 'productive', 'around.co': 'productive',
  'loom.com': 'productive', 'vimeo.com': 'productive', 'screencastify.com': 'productive',
  'calendly.com': 'productive', 'cal.com': 'productive', 'doodle.com': 'productive',
  'when2meet.com': 'productive', 'lettucemeet.com': 'productive', 'savvytime.com': 'productive',

  // Documentation & Writing
  'docs.google.com': 'productive', 'sheets.google.com': 'productive', 'slides.google.com': 'productive',
  'office.com': 'productive', 'onedrive.live.com': 'productive', 'dropbox.com': 'productive',
  'box.com': 'productive', 'drive.google.com': 'productive', 'icloud.com': 'productive',
  'quip.com': 'productive', 'papyrs.com': 'productive', 'simplenote.com': 'productive',
  'bear.app': 'productive', 'ulysses.app': 'productive', 'ia.net': 'productive',
  'typora.io': 'productive', 'marktext.app': 'productive', 'hackmd.io': 'productive',
  'stackedit.io': 'productive', 'dillinger.io': 'productive', 'markdownlivepreview.com': 'productive',

  // Analytics & Monitoring
  'analytics.google.com': 'productive', 'mixpanel.com': 'productive', 'amplitude.com': 'productive',
  'segment.com': 'productive', 'heap.io': 'productive', 'fullstory.com': 'productive',
  'hotjar.com': 'productive', 'crazyegg.com': 'productive', 'optimizely.com': 'productive',
  'vwo.com': 'productive', 'newrelic.com': 'productive', 'datadog.com': 'productive',
  'sentry.io': 'productive', 'rollbar.com': 'productive', 'bugsnag.com': 'productive',
  'loggly.com': 'productive', 'splunk.com': 'productive', 'sumologic.com': 'productive',
  'grafana.com': 'productive', 'prometheus.io': 'productive', 'kibana.com': 'productive',

  // NEUTRAL SITES (Reference, News, Shopping, General)
  // Search & Reference
  'google.com': 'neutral', 'bing.com': 'neutral', 'duckduckgo.com': 'neutral',
  'yahoo.com': 'neutral', 'baidu.com': 'neutral', 'yandex.com': 'neutral',
  'wikipedia.org': 'neutral', 'wikihow.com': 'neutral', 'wiktionary.org': 'neutral',
  'dictionary.com': 'neutral', 'thesaurus.com': 'neutral', 'merriam-webster.com': 'neutral',
  'oxforddictionaries.com': 'neutral', 'urban dictionary.com': 'neutral', 'acronymfinder.com': 'neutral',
  'wolframalpha.com': 'neutral', 'quora.com': 'neutral', 'answers.com': 'neutral',
  'ask.com': 'neutral', 'about.com': 'neutral', 'ehow.com': 'neutral',

  // Email Services
  'gmail.com': 'neutral', 'outlook.com': 'neutral', 'mail.yahoo.com': 'neutral',
  'mail.google.com': 'neutral', 'protonmail.com': 'neutral', 'tutanota.com': 'neutral',
  'mail.com': 'neutral', 'zoho.com': 'neutral', 'fastmail.com': 'neutral',
  'gmx.com': 'neutral', 'yandex.ru': 'neutral', 'aol.com': 'neutral',

  // News & Media
  'bbc.com': 'neutral', 'cnn.com': 'neutral', 'nytimes.com': 'neutral',
  'theguardian.com': 'neutral', 'reuters.com': 'neutral', 'apnews.com': 'neutral',
  'bloomberg.com': 'neutral', 'wsj.com': 'neutral', 'ft.com': 'neutral',
  'economist.com': 'neutral', 'forbes.com': 'neutral', 'fortune.com': 'neutral',
  'businessinsider.com': 'neutral', 'techcrunch.com': 'neutral', 'theverge.com': 'neutral',
  'wired.com': 'neutral', 'arstechnica.com': 'neutral', 'engadget.com': 'neutral',
  'cnet.com': 'neutral', 'zdnet.com': 'neutral', 'pcmag.com': 'neutral',
  'npr.org': 'neutral', 'pbs.org': 'neutral', 'aljazeera.com': 'neutral',
  'time.com': 'neutral', 'newsweek.com': 'neutral', 'usatoday.com': 'neutral',
  'washingtonpost.com': 'neutral', 'latimes.com': 'neutral', 'chicagotribune.com': 'neutral',
  'huffpost.com': 'neutral', 'politico.com': 'neutral', 'thehill.com': 'neutral',
  'axios.com': 'neutral', 'vox.com': 'neutral', 'slate.com': 'neutral',
  'salon.com': 'neutral', 'theatlantic.com': 'neutral', 'newyorker.com': 'neutral',

  // Shopping & E-commerce
  'amazon.com': 'neutral', 'ebay.com': 'neutral', 'walmart.com': 'neutral',
  'target.com': 'neutral', 'bestbuy.com': 'neutral', 'costco.com': 'neutral',
  'aliexpress.com': 'neutral', 'alibaba.com': 'neutral', 'etsy.com': 'neutral',
  'shopify.com': 'neutral', 'wayfair.com': 'neutral', 'overstock.com': 'neutral',
  'newegg.com': 'neutral', 'tigerdirect.com': 'neutral', 'bhphotovideo.com': 'neutral',
  'homedepot.com': 'neutral', 'lowes.com': 'neutral', 'ikea.com': 'neutral',
  'macys.com': 'neutral', 'nordstrom.com': 'neutral', 'zappos.com': 'neutral',
  'kohls.com': 'neutral', 'jcpenney.com': 'neutral', 'sears.com': 'neutral',
  'asos.com': 'neutral', 'zara.com': 'neutral', 'hm.com': 'neutral',
  'gap.com': 'neutral', 'oldnavy.com': 'neutral', 'forever21.com': 'neutral',
  'urbanoutfitters.com': 'neutral', 'anthropologie.com': 'neutral', 'freepeople.com': 'neutral',

  // Banking & Finance
  'paypal.com': 'neutral', 'venmo.com': 'neutral', 'cashapp.com': 'neutral',
  'stripe.com': 'neutral', 'square.com': 'neutral', 'wisebanking.com': 'neutral',
  'revolut.com': 'neutral', 'chime.com': 'neutral', 'sofi.com': 'neutral',
  'bankofamerica.com': 'neutral', 'chase.com': 'neutral', 'wellsfargo.com': 'neutral',
  'citibank.com': 'neutral', 'usbank.com': 'neutral', 'capitalone.com': 'neutral',
  'ally.com': 'neutral', 'marcus.com': 'neutral', 'discover.com': 'neutral',
  'americanexpress.com': 'neutral', 'visa.com': 'neutral', 'mastercard.com': 'neutral',
  'mint.com': 'neutral', 'personalcapital.com': 'neutral', 'ynab.com': 'neutral',
  'quickbooks.intuit.com': 'neutral', 'xero.com': 'neutral', 'freshbooks.com': 'neutral',
  'wave.com': 'neutral', 'expensify.com': 'neutral', 'concur.com': 'neutral',

  // Government & Official
  'usa.gov': 'neutral', 'irs.gov': 'neutral', 'ssa.gov': 'neutral',
  'usps.com': 'neutral', 'fedex.com': 'neutral', 'ups.com': 'neutral',
  'dhl.com': 'neutral', 'gov.uk': 'neutral', 'canada.ca': 'neutral',
  'uscis.gov': 'neutral', 'state.gov': 'neutral', 'whitehouse.gov': 'neutral',
  'congress.gov': 'neutral', 'supremecourt.gov': 'neutral', 'justice.gov': 'neutral',

  // Health & Medical
  'webmd.com': 'neutral', 'mayoclinic.org': 'neutral', 'healthline.com': 'neutral',
  'medlineplus.gov': 'neutral', 'nih.gov': 'neutral', 'cdc.gov': 'neutral',
  'who.int': 'neutral', 'drugs.com': 'neutral', 'rxlist.com': 'neutral',
  'medicine.net': 'neutral', 'patient.info': 'neutral', 'nhs.uk': 'neutral',
  'zocdoc.com': 'neutral', 'practo.com': 'neutral', 'doctorondemand.com': 'neutral',
  'teladoc.com': 'neutral', 'amwell.com': 'neutral', 'mdlive.com': 'neutral',
  'myfitnesspal.com': 'neutral', 'fitbit.com': 'neutral', 'strava.com': 'neutral',
  'mapmyrun.com': 'neutral', 'runkeeper.com': 'neutral', 'nike.com/run': 'neutral',

  // Travel & Maps
  'maps.google.com': 'neutral', 'waze.com': 'neutral', 'mapquest.com': 'neutral',
  'openstreetmap.org': 'neutral', 'google.com/maps': 'neutral', 'bing.com/maps': 'neutral',
  'expedia.com': 'neutral', 'booking.com': 'neutral', 'airbnb.com': 'neutral',
  'hotels.com': 'neutral', 'trivago.com': 'neutral', 'kayak.com': 'neutral',
  'priceline.com': 'neutral', 'orbitz.com': 'neutral', 'travelocity.com': 'neutral',
  'tripadvisor.com': 'neutral', 'yelp.com': 'neutral', 'foursquare.com': 'neutral',
  'uber.com': 'neutral', 'lyft.com': 'neutral', 'grab.com': 'neutral',
  'doordash.com': 'neutral', 'ubereats.com': 'neutral', 'grubhub.com': 'neutral',
  'postmates.com': 'neutral', 'seamless.com': 'neutral', 'deliveroo.com': 'neutral',
  'just-eat.com': 'neutral', 'zomato.com': 'neutral', 'swiggy.com': 'neutral',

  // Weather & Environment
  'weather.com': 'neutral', 'accuweather.com': 'neutral', 'weather.gov': 'neutral',
  'wunderground.com': 'neutral', 'weather underground.com': 'neutral', 'weatherbug.com': 'neutral',
  'windy.com': 'neutral', 'ventusky.com': 'neutral', 'meteoblue.com': 'neutral',

  // Real Estate
  'zillow.com': 'neutral', 'realtor.com': 'neutral', 'trulia.com': 'neutral',
  'redfin.com': 'neutral', 'apartments.com': 'neutral', 'rent.com': 'neutral',
  'craigslist.org': 'neutral', 'rightmove.co.uk': 'neutral', 'zoopla.co.uk': 'neutral',

  // DISTRACTING SITES (Social Media, Entertainment, Gaming)
  // Social Media
  'facebook.com': 'distracting', 'instagram.com': 'distracting', 'twitter.com': 'distracting',
  'x.com': 'distracting', 'tiktok.com': 'distracting', 'snapchat.com': 'distracting',
  'pinterest.com': 'distracting', 'tumblr.com': 'distracting', 'vk.com': 'distracting',
  'whatsapp.com': 'distracting', 'telegram.org': 'distracting', 'viber.com': 'distracting',
  'wechat.com': 'distracting', 'line.me': 'distracting', 'kakaotalk.com': 'distracting',
  'reddit.com': 'distracting', 'imgur.com': 'distracting', '9gag.com': 'distracting',
  'giphy.com': 'distracting', 'tenor.com': 'distracting', 'gfycat.com': 'distracting',
  'ifunny.co': 'distracting', 'memedroid.com': 'distracting', 'knowyourmeme.com': 'distracting',
  'cheezburger.com': 'distracting', 'failblog.org': 'distracting', 'thechive.com': 'distracting',
  'mastodon.social': 'distracting', 'truth social.com': 'distracting', 'parler.com': 'distracting',
  'gab.com': 'distracting', 'minds.com': 'distracting', 'gettr.com': 'distracting',
  'threads.net': 'distracting', 'bluesky.app': 'distracting', 't.me': 'distracting',

  // Video Streaming
  'youtube.com': 'distracting', 'youtu.be': 'distracting', 'vimeo.com': 'distracting',
  'dailymotion.com': 'distracting', 'twitch.tv': 'distracting', 'kick.com': 'distracting',
  'mixer.com': 'distracting', 'dlive.tv': 'distracting', 'trovo.live': 'distracting',
  'netflix.com': 'distracting', 'hulu.com': 'distracting', 'disneyplus.com': 'distracting',
  'hbomax.com': 'distracting', 'max.com': 'distracting', 'peacocktv.com': 'distracting',
  'paramount plus.com': 'distracting', 'apple.com/tv': 'distracting', 'primevideo.com': 'distracting',
  'crunchyroll.com': 'distracting', 'funimation.com': 'distracting', 'vrv.co': 'distracting',
  'pluto.tv': 'distracting', 'tubi.tv': 'distracting', 'vudu.com': 'distracting',
  'roku.com': 'distracting', 'sling.com': 'distracting', 'fubo.tv': 'distracting',
  'plex.tv': 'distracting', 'emby.media': 'distracting', 'jellyfin.org': 'distracting',

  // Gaming
  'steampowered.com': 'distracting', 'epicgames.com': 'distracting', 'origin.com': 'distracting',
  'ubisoft.com': 'distracting', 'ea.com': 'distracting', 'blizzard.com': 'distracting',
  'battle.net': 'distracting', 'playstation.com': 'distracting', 'xbox.com': 'distracting',
  'nintendo.com': 'distracting', 'riotgames.com': 'distracting', 'leagueoflegends.com': 'distracting',
  'valorant.com': 'distracting', 'dota2.com': 'distracting', 'csgo.com': 'distracting',
  'callofduty.com': 'distracting', 'fortnite.com': 'distracting', 'pubg.com': 'distracting',
  'apexlegends.com': 'distracting', 'minecraft.net': 'distracting', 'roblox.com': 'distracting',
  'chess.com': 'distracting', 'lichess.org': 'distracting', 'poker stars.com': 'distracting',
  'zynga.com': 'distracting', 'king.com': 'distracting', 'miniclip.com': 'distracting',
  'armorgames.com': 'distracting', 'kongregate.com': 'distracting', 'newgrounds.com': 'distracting',
  'addictinggames.com': 'distracting', 'crazygames.com': 'distracting', 'poki.com': 'distracting',
  'y8.com': 'distracting', 'friv.com': 'distracting', 'kizi.com': 'distracting',
  'playstation network.com': 'distracting', 'gamefaqs.com': 'distracting', 'ign.com': 'distracting',
  'gamespot.com': 'distracting', 'kotaku.com': 'distracting', 'polygon.com': 'distracting',
  'pcgamer.com': 'distracting', 'rockpapershotgun.com': 'distracting', 'eurogamer.net': 'distracting',
  'destructoid.com': 'distracting', 'giantbomb.com': 'distracting', 'gog.com': 'distracting',
  'humblebundle.com': 'distracting', 'greenmangaming.com': 'distracting', 'g2a.com': 'distracting',
  'cdkeys.com': 'distracting', 'mmoga.com': 'distracting', 'kinguin.net': 'distracting',

  // Entertainment & Celebrity News
  'tmz.com': 'distracting', 'eonline.com': 'distracting', 'people.com': 'distracting',
  'usmagazine.com': 'distracting', 'hollywoodreporter.com': 'distracting', 'variety.com': 'distracting',
  'deadline.com': 'distracting', 'buzzfeed.com': 'distracting', 'vice.com': 'distracting',
  'cracked.com': 'distracting', 'collegehumor.com': 'distracting', 'funnyordie.com': 'distracting',
  'comedycentral.com': 'distracting', 'adultswim.com': 'distracting', 'cartoonnetwork.com': 'distracting',
  'nickelodeon.com': 'distracting', 'disney.com': 'distracting', 'nick.com': 'distracting',
  'ew.com': 'distracting', 'entertainment weekly.com': 'distracting', 'rollingstone.com': 'distracting',
  'billboard.com': 'distracting', 'pitchfork.com': 'distracting', 'stereogum.com': 'distracting',
  'consequence.net': 'distracting', 'nme.com': 'distracting', 'spin.com': 'distracting',

  // Music & Podcasts
  'spotify.com': 'distracting', 'soundcloud.com': 'distracting', 'apple.com/music': 'distracting',
  'pandora.com': 'distracting', 'tidal.com': 'distracting', 'deezer.com': 'distracting',
  'last.fm': 'distracting', 'bandcamp.com': 'distracting', 'mixcloud.com': 'distracting',
  'audiomack.com': 'distracting', 'datpiff.com': 'distracting', 'spinrilla.com': 'distracting',
  'podcast.apple.com': 'distracting', 'podcasts.google.com': 'distracting', 'stitcher.com': 'distracting',
  'podbean.com': 'distracting', 'anchor.fm': 'distracting', 'spreaker.com': 'distracting',
  'castbox.fm': 'distracting', 'overcast.fm': 'distracting', 'pocketcasts.com': 'distracting',

  // Sports
  'espn.com': 'distracting', 'sports.yahoo.com': 'distracting', 'cbssports.com': 'distracting',
  'foxsports.com': 'distracting', 'nbcsports.com': 'distracting', 'bleacherreport.com': 'distracting',
  'sbnation.com': 'distracting', 'theringer.com': 'distracting', 'athleticnet': 'distracting',
  'nfl.com': 'distracting', 'nba.com': 'distracting', 'mlb.com': 'distracting',
  'nhl.com': 'distracting', 'mls.com': 'distracting', 'fifa.com': 'distracting',
  'uefa.com': 'distracting', 'premierleague.com': 'distracting', 'laliga.com': 'distracting',
  'bundesliga.com': 'distracting', 'seriea.com': 'distracting', 'ligue1.com': 'distracting',
  'cricket.com': 'distracting', 'icc-cricket.com': 'distracting', 'cricinfo.com': 'distracting',
  'formula1.com': 'distracting', 'nascar.com': 'distracting', 'indycar.com': 'distracting',
  'tennis.com': 'distracting', 'atptour.com': 'distracting', 'wtatennis.com': 'distracting',
  'wwe.com': 'distracting', 'aew.com': 'distracting', 'ufc.com': 'distracting',
  'bellator.com': 'distracting', 'onefc.com': 'distracting', 'pga.com': 'distracting',
  'olympics.com': 'distracting', 'fansided.com': 'distracting', 'si.com': 'distracting',

  // Dating & Relationships
  'tinder.com': 'distracting', 'bumble.com': 'distracting', 'hinge.co': 'distracting',
  'match.com': 'distracting', 'okcupid.com': 'distracting', 'pof.com': 'distracting',
  'eharmony.com': 'distracting', 'zoosk.com': 'distracting', 'christianmingle.com': 'distracting',
  'jdate.com': 'distracting', 'grindr.com': 'distracting', 'her.com': 'distracting',
  'coffee meets bagel.com': 'distracting', 'theinner circle.com': 'distracting', 'happn.com': 'distracting',
  'badoo.com': 'distracting', 'plenty of fish.com': 'distracting', 'meetme.com': 'distracting',

  // Shopping (Recreational/Fashion)
  'shein.com': 'distracting', 'fashionnova.com': 'distracting', 'prettylittlething.com': 'distracting',
  'boohoo.com': 'distracting', 'missguided.com': 'distracting', 'nasty gal.com': 'distracting',
  'revolve.com': 'distracting', 'dolls kill.com': 'distracting', 'hottopic.com': 'distracting',
  'spencers.com': 'distracting', 'boxlunch.com': 'distracting', 'thredup.com': 'distracting',
  'poshmark.com': 'distracting', 'mercari.com': 'distracting', 'depop.com': 'distracting',
  'vinted.com': 'distracting', 'grailed.com': 'distracting', 'stockx.com': 'distracting',
  'goat.com': 'distracting', 'farfetch.com': 'distracting', 'ssense.com': 'distracting',

  // Adult Content (Blocked)
  'pornhub.com': 'distracting', 'xvideos.com': 'distracting', 'xnxx.com': 'distracting',
  'xhamster.com': 'distracting', 'redtube.com': 'distracting', 'youporn.com': 'distracting',
  'spankbang.com': 'distracting', 'tube8.com': 'distracting', 'porn.com': 'distracting',
  'sex.com': 'distracting', 'brazzers.com': 'distracting', 'onlyfans.com': 'distracting',
  'chaturbate.com': 'distracting', 'myfreecams.com': 'distracting', 'livejasmin.com': 'distracting',
  'cam4.com': 'distracting', 'bongacams.com': 'distracting', 'stripchat.com': 'distracting',
  'camsoda.com': 'distracting', 'imlive.com': 'distracting', 'flirt4free.com': 'distracting',

  // Gambling & Betting
  'draftkings.com': 'distracting', 'fanduel.com': 'distracting', 'bet365.com': 'distracting',
  'williamhill.com': 'distracting', 'paddypower.com': 'distracting', 'betfair.com': 'distracting',
  'unibet.com': 'distracting', 'bovada.lv': 'distracting', 'betway.com': 'distracting',
  '888casino.com': 'distracting', 'casinocom': 'distracting', 'pokerstars.com': 'distracting',
  'partypoker.com': 'distracting', 'full tilt poker.com': 'distracting', 'ggpoker.com': 'distracting',
  'betmgm.com': 'distracting', 'caesars.com': 'distracting', 'pointsbet.com': 'distracting',
  'barstoolsports.com': 'distracting', 'stake.com': 'distracting', 'rollbit.com': 'distracting',

  // Forums & Discussion
  'quora.com': 'distracting', '4chan.org': 'distracting', '8kun.top': 'distracting',
  'somethingawful.com': 'distracting', 'resetera.com': 'distracting', 'neogaf.com': 'distracting',
  'kiwifarms.net': 'distracting', 'lolcow.farm': 'distracting', 'dreamwidth.org': 'distracting',
  'livejournal.com': 'distracting', 'deviantart.com': 'distracting', 'fanfiction.net': 'distracting',
  'archiveofourown.org': 'distracting', 'wattpad.com': 'distracting', 'quotev.com': 'distracting',
  'goodreads.com': 'distracting', 'myanimelist.net': 'distracting', 'anilist.co': 'distracting',
  'kitsu.io': 'distracting', 'letterboxd.com': 'distracting', 'trakt.tv': 'distracting',
  'imdb.com': 'distracting', 'rottentomatoes.com': 'distracting', 'metacritic.com': 'distracting',

  // Memes & Humor
  'knowyourmeme.com': 'distracting', 'memegenerator.net': 'distracting', 'imgflip.com': 'distracting',
  'quickmeme.com': 'distracting', 'makeameme.org': 'distracting', 'mematic.net': 'distracting',
  'kapwing.com': 'distracting', 'imgflip.com': 'distracting', 'damnlol.com': 'distracting',
  'funnyjunk.com': 'distracting', 'ebaumsworld.com': 'distracting', 'break.com': 'distracting',

  // Miscellaneous Time-Wasters
  'stumbleupon.com': 'distracting', 'mix.com': 'distracting', 'digg.com': 'distracting',
  'slashdot.org': 'distracting', 'fark.com': 'distracting', 'metafilter.com': 'distracting',
  'bored panda.com': 'distracting', 'brightside.me': 'distracting', 'upworthy.com': 'distracting',
  'wimp.com': 'distracting', 'viralnova.com': 'distracting', 'tickld.com': 'distracting',
  'distractify.com': 'distracting', 'ranker.com': 'distracting', 'listverse.com': 'distracting',
  'cracked.com': 'distracting', 'mentalfloss.com': 'distracting', 'theoatmeal.com': 'distracting',
  'xkcd.com': 'distracting', 'smbc-comics.com': 'distracting', 'explosm.net': 'distracting',
  'webtoons.com': 'distracting', 'tapas.io': 'distracting', 'mangadex.org': 'distracting',
  'mangaplus.shueisha.co.jp': 'distracting', 'viz.com': 'distracting', 'comixology.com': 'distracting',

  // News Aggregators & Clickbait
  'news.ycombinator.com': 'distracting', 'lobste.rs': 'distracting', 'hacker news.com': 'distracting',
  'producthunt.com': 'distracting', 'indiehackers.com': 'distracting', 'betalist.com': 'distracting',
  'feedly.com': 'distracting', 'flipboard.com': 'distracting', 'pocket.com': 'distracting',
  'instapaper.com': 'distracting', 'readability.com': 'distracting', 'getpocket.com': 'distracting',

  // Crypto & Trading
  'coinbase.com': 'distracting', 'binance.com': 'distracting', 'kraken.com': 'distracting',
  'crypto.com': 'distracting', 'gemini.com': 'distracting', 'bitfinex.com': 'distracting',
  'bitstamp.net': 'distracting', 'kucoin.com': 'distracting', 'gate.io': 'distracting',
  'coinmarketcap.com': 'distracting', 'coingecko.com': 'distracting', 'tradingview.com': 'distracting',
  'robinhood.com': 'distracting', 'webull.com': 'distracting', 'etrade.com': 'distracting',
  'tdameritrade.com': 'distracting', 'fidelity.com': 'distracting', 'schwab.com': 'distracting',
  'interactive brokers.com': 'distracting', 'tastyworks.com': 'distracting', 'thinkorswim.com': 'distracting',

  // Additional Popular Sites
  'aliexpress.com': 'distracting', 'wish.com': 'distracting', 'gearbest.com': 'distracting',
  'banggood.com': 'distracting', 'dhgate.com': 'distracting', 'taobao.com': 'distracting',
  'jd.com': 'distracting', 'tmall.com': 'distracting', 'lazada.com': 'distracting',
  'shopee.com': 'distracting', 'tokopedia.com': 'distracting', 'bukalapak.com': 'distracting',
  'flipkart.com': 'distracting', 'myntra.com': 'distracting', 'ajio.com': 'distracting',
  'nykaa.com': 'distracting', 'meesho.com': 'distracting', 'paytmmall.com': 'distracting',
  'snapdeal.com': 'distracting', 'shopclues.com': 'distracting', 'limeroad.com': 'distracting',
  'jabong.com': 'distracting', 'lifestyle.com': 'distracting', 'westside.com': 'distracting',
  'max fashion.com': 'distracting', 'pantaloons.com': 'distracting', 'centralonline.com': 'distracting',

  // International Social Media
  'weibo.com': 'distracting', 'qq.com': 'distracting', 'wechat.com': 'distracting',
  'douyin.com': 'distracting', 'kuaishou.com': 'distracting', 'bilibili.com': 'distracting',
  'youku.com': 'distracting', 'iqiyi.com': 'distracting', 'tudou.com': 'distracting',
  'odnoklassniki.ru': 'distracting', 'ok.ru': 'distracting', 'mail.ru': 'distracting',
  'yandex.ru/video': 'distracting', 'rutube.ru': 'distracting', 'vk.com/video': 'distracting',
  'line.me': 'distracting', 'naver.com': 'distracting', 'kakao.com': 'distracting',
  'daum.net': 'distracting', 'cyworld.com': 'distracting', 'band.us': 'distracting',
  'mixi.jp': 'distracting', 'nicovideo.jp': 'distracting', 'pixiv.net': 'distracting',
  'ameblo.jp': 'distracting', 'fc2.com': 'distracting', 'hatena.ne.jp': 'distracting',

  // Additional Gaming Platforms
  'itch.io': 'distracting', 'gamejolt.com': 'distracting', 'crazygames.com': 'distracting',
  'silvergames.com': 'distracting', 'agame.com': 'distracting', 'girlsgogames.com': 'distracting',
  'mousebreaker.com': 'distracting', 'a10.com': 'distracting', 'primarygames.com': 'distracting',
  'coolmathgames.com': 'distracting', 'mathplayground.com': 'distracting', 'funbrain.com': 'distracting',
  'abcya.com': 'distracting', 'starfall.com': 'distracting', 'pbskids.org': 'distracting',
  'nick jr.com': 'distracting', 'noggin.com': 'distracting', 'sesamestreet.org': 'distracting',

  // More Streaming Services
  'showtime.com': 'distracting', 'starz.com': 'distracting', 'epix.com': 'distracting',
  'mgm plus.com': 'distracting', 'acorn.tv': 'distracting', 'britbox.com': 'distracting',
  'shudder.com': 'distracting', 'sundancenow.com': 'distracting', 'mubi.com': 'distracting',
  'criterion channel.com': 'distracting', 'kanopy.com': 'distracting', 'hoopla digital.com': 'distracting',
  'freevee.com': 'distracting', 'imdb tv.com': 'distracting', 'xumo.tv': 'distracting',
  'crackle.com': 'distracting', 'popcornflix.com': 'distracting', 'yidio.com': 'distracting',

  // Live Streaming & Content Creation
  'onlyfans.com': 'distracting', 'patreon.com': 'distracting', 'ko-fi.com': 'distracting',
  'buymeacoffee.com': 'distracting', 'liberapay.com': 'distracting', 'subscribestar.com': 'distracting',
  'fanhouse.app': 'distracting', 'fansly.com': 'distracting', 'justforfans.com': 'distracting',
  'streamlabs.com': 'distracting', 'streamelements.com': 'distracting', 'nightbot.tv': 'distracting',
  'obs.live': 'distracting', 'restream.io': 'distracting', 'castr.io': 'distracting',

  // Additional Time Wasters
  'buzzfeed.com': 'distracting', 'buzzfeednews.com': 'distracting', 'tasty.co': 'distracting',
  'bored button.com': 'distracting', 'theuselessweb.com': 'distracting', 'pointer pointer.com': 'distracting',
  'pointerpointer.com': 'distracting', 'trypap.com': 'distracting', 'hackertyper.com': 'distracting',
  'fallingfalling.com': 'distracting', 'omfgdogs.com': 'distracting', 'koalastothemax.com': 'distracting',
  'neonflames.com': 'distracting', 'thisissand.com': 'distracting', 'isitchristmas.com': 'distracting',
  'ismycomputeron.com': 'distracting', 'endless.horse': 'distracting', 'checkboxrace.com': 'distracting',
  'beesbeesbees.com': 'distracting', 'sanger.dk': 'distracting', 'staggeringbeauty.com': 'distracting',
  'eelslap.com': 'distracting', 'cat-bounce.com': 'distracting', 'republiquedesmangues.fr': 'distracting',
  'cant-not-tweet-this.com': 'distracting', 'burymewithmymoney.com': 'distracting', 'cachemonet.com': 'distracting',
  'heyyeyaaeyaaaeyaeyaa.com': 'distracting', 'nullingthevoid.com': 'distracting', 'patience-is-a-virtue.org': 'distracting',
  'corndogoncorndog.com': 'distracting', 'papertoilet.com': 'distracting', 'randomcolour.com': 'distracting',
  'blankwindows.com': 'distracting', 'thatfeel.org': 'distracting', 'ducksarethebest.com': 'distracting',
  'leekspin.com': 'distracting', 'r33b.net': 'distracting', 'drawing.garden': 'distracting'
};

let currentTab = null, currentSessionStart = null, isIdle = false;
let focusSession = null, breakTimer = null, db = null;
let blockedSites = [], goals = [], customCategories = {};

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FocusTrackDB', 2);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => { db = request.result; resolve(db); };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('timeEntries')) {
        const store = db.createObjectStore('timeEntries', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp'); store.createIndex('date', 'date'); store.createIndex('domain', 'domain');
      }
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('blockedSites')) db.createObjectStore('blockedSites', { keyPath: 'domain' });
      if (!db.objectStoreNames.contains('goals')) db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('focusSessions')) {
        const store = db.createObjectStore('focusSessions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date');
      }
    };
  });
}

function getDomain(url) {
  try { const urlObj = new URL(url); let domain = urlObj.hostname; if (domain.startsWith('www.')) domain = domain.substring(4); return domain; } catch (e) { return ''; }
}

function getCategoryForUrl(url) {
  const domain = getDomain(url);
  return customCategories[domain] || DEFAULT_CATEGORIES[domain] || CATEGORIES.UNCATEGORIZED;
}

function dbOp(storeName, mode, operation) {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addTimeEntry(entry) {
  const date = new Date(entry.timestamp).toISOString().split('T')[0];
  return dbOp('timeEntries', 'readwrite', store => store.add({ ...entry, date }));
}

async function getTodayEntries() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  return dbOp('timeEntries', 'readonly', store => {
    const index = store.index('timestamp');
    return index.getAll(IDBKeyRange.bound(today.getTime(), tomorrow.getTime()));
  });
}

async function getDateRangeEntries(startDate, endDate) {
  return dbOp('timeEntries', 'readonly', store => {
    const index = store.index('timestamp');
    return index.getAll(IDBKeyRange.bound(startDate.getTime(), endDate.getTime()));
  });
}

async function saveSetting(key, value) {
  return dbOp('settings', 'readwrite', store => store.put({ key, value }));
}

async function getSetting(key, defaultValue = null) {
  const result = await dbOp('settings', 'readonly', store => store.get(key));
  return result ? result.value : defaultValue;
}

async function loadBlockedSites() {
  blockedSites = await dbOp('blockedSites', 'readonly', store => store.getAll());
}

async function loadGoals() {
  const all = await dbOp('goals', 'readonly', store => store.getAll());
  goals = all.filter(g => g.enabled);
}

function shouldBlockSite(domain) {
  // If in focus session with whitelist, block everything not in whitelist
  if (focusSession && focusSession.allowedSites && focusSession.allowedSites.length > 0) {
    const isAllowed = focusSession.allowedSites.some(allowed => domain.includes(allowed) || allowed.includes(domain));
    if (!isAllowed) return true; // Block if not in whitelist
  }

  // Regular blocking logic
  const site = blockedSites.find(s => s.domain === domain);
  if (!site || !site.enabled) {
    // If in focus session without whitelist, block distracting sites
    if (focusSession) {
      const category = getCategoryForUrl('https://' + domain);
      if (category === 'distracting') return true;
    }
    return false;
  }

  if (focusSession && site.category === 'distracting') return true;
  if (site.blockType === 'always') return true;
  if (site.blockType === 'scheduled') return isWithinSchedule(site.schedule);
  if (site.blockType === 'timeLimit') return checkTimeLimitSync(domain, site.limitMinutes);
  return false;
}

function isWithinSchedule(schedule) {
  if (!schedule) return false;
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (!schedule.days || !schedule.days.includes(currentDay)) return false;
  const [startHour, startMin] = schedule.startTime.split(':').map(Number);
  const [endHour, endMin] = schedule.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

function checkTimeLimitSync(domain, limitMinutes) {
  return false; // Simplified for now
}

async function checkGoals() {
  const entries = await getTodayEntries();
  for (const goal of goals) {
    if (goal.type === 'productiveTime') await checkProductiveGoal(goal, entries);
    else if (goal.type === 'distractingLimit') await checkDistractingLimit(goal, entries);
    else if (goal.type === 'siteLimit') await checkSiteLimit(goal, entries);
  }
}

async function checkProductiveGoal(goal, entries) {
  const productiveTime = entries.filter(e => e.category === 'productive').reduce((sum, e) => sum + e.duration, 0);
  const targetSeconds = goal.targetMinutes * 60;
  const progress = Math.round((productiveTime / targetSeconds) * 100);
  const notifiedHalfway = await getSetting(`goal_${goal.id}_halfway`, false);
  const notifiedAchieved = await getSetting(`goal_${goal.id}_achieved`, false);
  if (progress >= 50 && progress < 60 && !notifiedHalfway) {
    chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: 'Halfway There!', message: `You're halfway to your daily ${goal.targetMinutes} minute productive time goal!` });
    await saveSetting(`goal_${goal.id}_halfway`, true);
  }
  if (progress >= 100 && !notifiedAchieved) {
    chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '🎉 Goal Achieved!', message: `Congratulations! You've reached your daily productive time goal!` });
    await saveSetting(`goal_${goal.id}_achieved`, true);
  }
}

async function checkDistractingLimit(goal, entries) {
  const distractingTime = entries.filter(e => e.category === 'distracting').reduce((sum, e) => sum + e.duration, 0);
  const limitSeconds = goal.limitMinutes * 60;
  if (distractingTime >= limitSeconds) {
    const notified = await getSetting(`goal_${goal.id}_exceeded`, false);
    if (!notified) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '⚠️ Distraction Limit Exceeded', message: `You've exceeded your ${goal.limitMinutes} minute distraction limit today.` });
      await saveSetting(`goal_${goal.id}_exceeded`, true);
    }
  }
}

async function checkSiteLimit(goal, entries) {
  const siteTime = entries.filter(e => e.domain === goal.domain).reduce((sum, e) => sum + e.duration, 0);
  const limitSeconds = goal.limitMinutes * 60;
  if (siteTime >= limitSeconds * 0.8 && siteTime < limitSeconds) {
    const notified = await getSetting(`goal_${goal.id}_warning`, false);
    if (!notified) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '⚠️ Approaching Limit', message: `You've used 80% of your ${goal.limitMinutes} minute limit for ${goal.domain}.` });
      await saveSetting(`goal_${goal.id}_warning`, true);
    }
  }
  if (siteTime >= limitSeconds) {
    const notified = await getSetting(`goal_${goal.id}_exceeded`, false);
    if (!notified) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '🚫 Time Limit Reached', message: `You've reached your ${goal.limitMinutes} minute limit for ${goal.domain}.` });
      await saveSetting(`goal_${goal.id}_exceeded`, true);
    }
  }
}

function startTracking(tab) {
  if (isIdle || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  const domain = getDomain(tab.url);
  currentTab = { url: tab.url, domain, title: tab.title || domain, category: getCategoryForUrl(tab.url) };
  currentSessionStart = Date.now();
}

async function saveCurrentSession() {
  if (!currentTab || !currentSessionStart) return;
  const duration = Math.floor((Date.now() - currentSessionStart) / 1000);
  if (duration < 1) return;
  try {
    await addTimeEntry({ url: currentTab.url, domain: currentTab.domain, title: currentTab.title, category: currentTab.category, duration, timestamp: currentSessionStart });
    currentSessionStart = Date.now();
  } catch (error) { console.error('Save error:', error); }
}

chrome.idle.setDetectionInterval(300);
chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'idle' || state === 'locked') { saveCurrentSession(); isIdle = true; }
  else { isIdle = false; chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { if (tabs.length > 0) startTracking(tabs[0]); }); }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => { saveCurrentSession(); if (tab) startTracking(tab); });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) { saveCurrentSession(); startTracking(tab); }
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) {
    const domain = getDomain(details.url);
    if (shouldBlockSite(domain)) {
      const blockedUrl = chrome.runtime.getURL('blocked.html') +
        '?domain=' + encodeURIComponent(domain) +
        '&url=' + encodeURIComponent(details.url);
      chrome.tabs.update(details.tabId, { url: blockedUrl });
    }
  }
});

chrome.alarms.create('saveTracking', { periodInMinutes: 0.5 });
chrome.alarms.create('checkGoals', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'saveTracking') saveCurrentSession();
  else if (alarm.name === 'checkGoals') checkGoals();
  else if (alarm.name === 'focusSessionEnd') endFocusSession(true);
  else if (alarm.name === 'breakTimerEnd') endBreakTimer();
});

async function startFocusSession(duration, allowedSites = []) {
  const now = Date.now();
  focusSession = {
    startTime: now,
    endTime: now + duration * 60 * 1000,
    duration,
    completed: false,
    allowedSites: allowedSites
  };
  chrome.alarms.create('focusSessionEnd', { when: focusSession.endTime });
  return focusSession;
}

async function endFocusSession(completed = false) {
  if (!focusSession) return;
  focusSession.completed = completed;
  if (db) {
    const date = new Date(focusSession.startTime).toISOString().split('T')[0];
    await dbOp('focusSessions', 'readwrite', store => store.add({ ...focusSession, date }));
  }
  if (completed) chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '🎯 Focus Session Complete!', message: `Great job! You completed a ${focusSession.duration} minute focus session.` });
  focusSession = null;
}

function startBreakTimer(minutes) {
  const now = Date.now();
  breakTimer = { startTime: now, endTime: now + minutes * 60 * 1000, duration: minutes };
  chrome.alarms.create('breakTimerEnd', { when: breakTimer.endTime });
  return breakTimer;
}

function endBreakTimer() {
  if (!breakTimer) return;
  chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '☕ Break Time Over', message: 'Time to get back to work!' });
  breakTimer = null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch(err => sendResponse({ success: false, error: err.message }));
  return true;
});

async function handleMessage(message) {
  const currentDuration = currentSessionStart ? Math.floor((Date.now() - currentSessionStart) / 1000) : 0;
  switch (message.action) {
    case 'getStatus': return { success: true, data: { status: isIdle ? 'idle' : currentTab ? 'tracking' : 'not-tracking', currentTab, currentDuration } };
    case 'getTodayStats': return { success: true, data: await getTodayEntries() };
    case 'getDateRangeStats': return { success: true, data: await getDateRangeEntries(new Date(message.startDate), new Date(message.endDate)) };
    case 'startFocusSession': return { success: true, data: await startFocusSession(message.duration, message.allowedSites || []) };
    case 'endFocusSession': await endFocusSession(false); return { success: true };
    case 'getFocusSession': return { success: true, data: focusSession };
    case 'startBreakTimer': return { success: true, data: startBreakTimer(message.minutes) };
    case 'getBreakTimer': return { success: true, data: breakTimer };
    case 'addBlockedSite': await dbOp('blockedSites', 'readwrite', store => store.put(message.site)); await loadBlockedSites(); return { success: true };
    case 'removeBlockedSite': await dbOp('blockedSites', 'readwrite', store => store.delete(message.domain)); await loadBlockedSites(); return { success: true };
    case 'getBlockedSites': return { success: true, data: blockedSites };
    case 'addGoal': await dbOp('goals', 'readwrite', store => store.add(message.goal)); await loadGoals(); return { success: true };
    case 'updateGoal': await dbOp('goals', 'readwrite', store => store.put(message.goal)); await loadGoals(); return { success: true };
    case 'deleteGoal': await dbOp('goals', 'readwrite', store => store.delete(message.goalId)); await loadGoals(); return { success: true };
    case 'getGoals': return { success: true, data: goals };
    case 'saveSetting': await saveSetting(message.key, message.value); if (message.key === 'customCategories') customCategories = message.value; return { success: true };
    case 'getSetting': return { success: true, data: await getSetting(message.key, message.defaultValue) };
    case 'refreshCurrentTab':
      await saveCurrentSession();
      if (currentTab) {
        currentTab.category = getCategoryForUrl(currentTab.url);
        currentSessionStart = Date.now();
      }
      return { success: true };
    case 'checkIfBlocked':
      const domain = getDomain(message.url);
      const isBlocked = shouldBlockSite(domain);
      return { success: true, blocked: isBlocked };
    case 'exportData': return { success: true, data: await exportAllData() };
    case 'importData': return await importAllData(message.data);
    case 'getFocusSessions': return { success: true, data: await dbOp('focusSessions', 'readonly', store => store.getAll()) };
    default: return { success: false, error: 'Unknown action' };
  }
}

async function exportAllData() {
  const timeEntries = await dbOp('timeEntries', 'readonly', store => store.getAll());
  const settings = await dbOp('settings', 'readonly', store => store.getAll());
  return { timeEntries, blockedSites, goals, settings, customCategories, exportDate: new Date().toISOString() };
}

async function importAllData(importedData) {
  try {
    // Import time entries
    if (importedData.timeEntries && Array.isArray(importedData.timeEntries)) {
      for (const entry of importedData.timeEntries) {
        await dbOp('timeEntries', 'readwrite', store => store.put(entry));
      }
    }

    // Import settings
    if (importedData.settings && Array.isArray(importedData.settings)) {
      for (const setting of importedData.settings) {
        await saveSetting(setting.key, setting.value);
      }
    }

    // Import custom categories
    if (importedData.customCategories) {
      customCategories = importedData.customCategories;
      await saveSetting('customCategories', importedData.customCategories);
    }

    // Import blocked sites
    if (importedData.blockedSites && Array.isArray(importedData.blockedSites)) {
      for (const site of importedData.blockedSites) {
        await dbOp('blockedSites', 'readwrite', store => store.put(site));
      }
      await loadBlockedSites();
    }

    // Import goals
    if (importedData.goals && Array.isArray(importedData.goals)) {
      for (const goal of importedData.goals) {
        await dbOp('goals', 'readwrite', store => store.put(goal));
      }
      await loadGoals();
    }

    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
}

async function init() {
  try {
    await initDB();
    customCategories = await getSetting('customCategories', {});
    await loadBlockedSites();
    await loadGoals();
    console.log('FocusTrack AI Complete initialized successfully');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { if (tabs.length > 0) startTracking(tabs[0]); });
  } catch (error) { console.error('Init error:', error); }
}

init();
