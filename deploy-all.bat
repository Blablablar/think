@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set ENVID=cloud1-2gt03efv3c08ce28
set FUNCS=updateUserProfile publishCreativity getTodayList getHotList getRecommendList getMyCreativities getCreativityDetail searchCreativity getTagCreativities getMyFavorites toggleFavorite toggleLike getMyLikedCreativities getMyCommentedCreativities addComment getComments deleteComment replyComment getUserCreativities claimCreativity unclaimCreativity getMyClaims submitImplementation updateImplementation deleteImplementation getMyImplementations getImplementationByCreativity toggleFollow getFollowedCreativities getUserInfo getNotifications markNotificationRead getUnreadCount reviewVideo

set TOTAL=0
set SUCCESS=0
set FAILED=0

for %%F in (%FUNCS%) do set /a TOTAL+=1

set IDX=0
for %%F in (%FUNCS%) do (
  set /a IDX+=1
  echo [!IDX!/!TOTAL!] Deploying %%F...
  tcb fn deploy %%F --force --env-id %ENVID% --dir "cloudfunctions/%%F"
  if !errorlevel! equ 0 (
    echo   [OK] %%F
    set /a SUCCESS+=1
  ) else (
    echo   [FAIL] %%F
    set /a FAILED+=1
  )
)

echo.
echo ===== Deployment Summary =====
echo Success: !SUCCESS! / !TOTAL!
echo Failed: !FAILED!

endlocal
