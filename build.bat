@echo off

REM npm install -g uglify-js clean-css-cli

set BASEDIR=%~dp0
set HTMLDIR=%BASEDIR%\html

cd /d %HTMLDIR%\datetimepicker\
call :mincss bootstrap-datetimepicker

cd /d %HTMLDIR%\jsonview\
call :mincss jquery.jsonview

cd /d %HTMLDIR%\lightbox\
call :mincss jquery.lightbox

cd /d %HTMLDIR%\simplecolorpicker\
call :mincss jquery.simple-color-picker

cd /d %HTMLDIR%\plugins\css\
type jquery.*.css    >  plugins.css
type bootstrap.*.css >> plugins.css
type ui.*.css        >> plugins.css
call :mincss plugins


cd /d %HTMLDIR%\corejs\
copy /b core.*.js corejs.js
call :minjs corejs

cd /d %HTMLDIR%\datetimepicker\
call :minjs bootstrap-datetimepicker

cd /d %HTMLDIR%\docxjs\
call :minjs docx-preview

cd /d %HTMLDIR%\domtoimage\
call :minjs dom-to-image

cd /d %HTMLDIR%\jsonview\
call :minjs jquery.jsonview

cd /d %HTMLDIR%\jszip\
call :minjs jszip

cd /d %HTMLDIR%\lightbox\
call :minjs jquery.lightbox

cd /d %HTMLDIR%\simplecolorpicker\
call :minjs jquery.simple-color-picker

cd /d %HTMLDIR%\plugins\js\
type jquery.*.js    >  plugins.js
type bootstrap.*.js >> plugins.js
call :minjs plugins


echo --------------------------------------
echo DONE.

cd /d %BASEDIR%
exit /b


:minjs
echo --------------------------------------
echo --  minify js: %1
call uglifyjs.cmd %1.js --warn --compress --mangle -o %1.min.js
exit /b

:mincss
echo --------------------------------------
echo --  minify css: %1
call cleancss.cmd -d -o %1.min.css %1.css
exit /b
