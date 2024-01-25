@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Автоматический скрипт, для инициализации репозитория
REM и отправки коммитов в ветку main.
REM 
REM v7
REM 
REM Добавьте этот скрипт в папку вашего проекта,
REM и он всё сделает за вас

if not exist .git (
    echo Инициализируем новый репозиторий

REM Ожидание 3 секунд
timeout /t 3 >nul

echo Инициализация репозитория git
echo git init
echo.
REM Инициализация репозитория git
git init

echo Добавление всех файлов в индекс git
echo git add .
echo.
REM Добавление всех файлов в индекс git
git add .

echo Создание первого коммита
echo git commit -m "First commit"
echo.
REM Создание первого коммита
git commit -m "First commit"

echo Открытие веб-страницы
echo https://github.com/new
echo.
REM Открытие веб-страницы https://github.com/new в браузере
start https://github.com/new

REM Ожидание ввода URL репозитория
set /p repoURL="Введите URL вашего репозитория: "

echo Добавление удаленного репозитория
echo git remote add origin !repoURL!
echo.
REM Добавление удаленного репозитория
git remote add origin !repoURL!

echo Отправка коммита в удаленный репозиторий
echo git push -u origin main
echo.
REM Отправка коммитов в удаленный репозиторий
git push -u origin main


echo.
echo Репозиторий успешно создан
echo.
echo.
echo.
echo.
echo.
echo Используйте этот-же скрипт, для создания и загрузки коммитов в ветку main
echo.
REM Ожидание 6 секунд
timeout /t 6 >nul

exit
)

echo Создание нового коммита
echo.

REM Проверка наличия файла last_commit.txt и его содержимого
if exist .git/last_commit.txt (
    set /p lastCommit=<.git/last_commit.txt
    if not "!lastCommit!"=="" (
        echo Последний коммит: !lastCommit!
    )
) else (
    echo Предыдущих коммитов нет
)

set /p commitMessage="Описание коммита: "
if "!commitMessage!"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
    set datetime=!datetime:~6,2!.!datetime:~4,2!.!datetime:~0,4! - !datetime:~8,2!:!datetime:~10,2! - no description
    set commitMessage=!datetime!
)
git add .
git commit -m "%commitMessage%"
echo.
echo Отправка коммита в GitHub...
echo.
git push origin main
echo commitMessage = "%commitMessage%"
echo.

REM Удаление файла last_commit.txt, если он существует
if exist .git/last_commit.txt (
    del .git/last_commit.txt
)

REM Создание нового файла .git/last_commit.txt
echo !commitMessage! > .git/last_commit.txt

echo Коммит успешно создан и отправлен
timeout /t 2 >nul
exit


