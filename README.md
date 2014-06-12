ING CHART
=========

La fonction pour suivre un budget par catégorie du site d'ING Direct étant cassé depuis un moment j'ai décidé d'implémenter la mienne.

Pour visualiser son graph il faut télécharger l'historique de ses opérations en CSV et charger le fichier va le bouton *"Parcourir"* de la page.

Entièrement en JS / HTML5, cette page ne communique avec aucune autre machine pendant que vous l'utiliser. Vous pouvez directement L'enregistrer pour l'utiliser localement si vous le souhaitez (voire la partie concernant l'installation).

Ou bien vous pouvez utiliser celle que j'héberge sur [mon site personnel](http://1pxsolidblack.pl/ing_chart/).

INSTALLATION
------------

Si vous souhaitez utiliser ING CHART localement il vous faudra :
+ Télécharger les sources (*git clone* ou le [zip](https://codeload.github.com/jaesivsm/ing_chart/zip/master)).
+ Installer les bibliothèques.

Pour le deuxième point, la façon de procéder dépendra de votre système d'exploitation.
+ Sous un UNIX, il faudra simplement exécuter le script *setup.sh*.
+ Sous Mac, il devrait être aussi possible d'exécuter le script pourvu que vous disposiez des binaires *wget* et *unzip*. Sinon il faudra utiliser la méthodes manuelles.
+ Sous Windows, pas le choix, il faut installer les bibliothèques à la main.

**Procédure d'installation à la main**
+ Téléchargez [jquery_ui](http://jqueryui.com/resources/download/jquery-ui-1.10.4.zip).
+ Extrayez l'archive.
+ Déplacez le dossier *jquery-ui-1.10.4/css* dans *lib/jquery*.
+ Déplacez le fichier *jquery-ui-1.10.4/js/jquery-ui-1.10.4.min.js* vers *lib/jquery/jquery-ui.js*.
+ Déplacez le fichier *jquery-ui-1.10.4/js/jquery-1.10.2.js* vers *lib/jquery/jquery.js*.

+ Téléchargez [datepicker](https://raw.githubusercontent.com/jquery/jquery-ui/master/ui/i18n/datepicker-fr.js).
+ Placez le fichier dans le dossier *lib*.

+ Téléchargez [Chart.js](https://raw.githubusercontent.com/nnnick/Chart.js/master/Chart.js).
+ Placez le fichier dans le dossier *lib/jquery*.
