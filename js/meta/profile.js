/* ───────── PianoSpark – meta/profile.js ───────── */
/* Player profile page */

function profilePage(){
  var h = '<div class="card">';
  h += '<div><b>Player Profile</b></div>';
  h += '<div>Level: '+S.playerLevel+'</div>';
  h += '<div>XP: '+S.playerXP+'</div>';
  h += '<div>Songs Completed: '+S.playerStats.songsCompleted+'</div>';
  h += '<div>Lessons Completed: '+S.playerStats.lessonsCompleted+'</div>';
  h += '<div>Exercises Completed: '+S.playerStats.exercisesCompleted+'</div>';
  h += '<div>Practice Minutes: '+S.playerStats.totalPracticeMinutes+'</div>';
  h += '<div>Best Streak: '+S.playerStats.streakBest+'</div>';
  h += '</div>';

  // Achievements list
  h += '<div class="card">';
  h += '<div><b>Achievements</b></div>';
  var achList = window.ACHIEVEMENTS || [];
  for(var i=0;i<achList.length;i++){
    var a = achList[i];
    var unlocked = S.playerAchievements[a.id];
    h += '<div>'+(unlocked ? '&#9733; ' : '&#9744; ')+a.name+'</div>';
  }
  h += '</div>';

  // Level progress bar
  var progress = (typeof getLevelProgress === "function") ? getLevelProgress() : 0;
  var pct = Math.round(progress * 100);
  h += '<div class="card">';
  h += '<div><b>Level Progress</b></div>';
  h += '<div style="background:#333;border-radius:4px;overflow:hidden;height:16px">';
  h += '<div style="background:var(--accent,#4caf50);height:100%;width:'+pct+'%"></div>';
  h += '</div>';
  h += '<div style="text-align:center;font-size:0.85em;margin-top:4px">'+pct+'% to Level '+(S.playerLevel+1)+'</div>';
  h += '</div>';

  return h;
}
