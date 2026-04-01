/* PianoSpark – home/home_cards.js */
/* Individual dashboard card renderers */
function renderHomeProfileCard(data){
  var h = '<div class="card">';
  h += '<div><b>Profile</b></div>';
  h += '<div>Level: '+data.level+'</div>';
  h += '<div>XP: '+data.xp+'</div>';
  h += '<div>Streak: '+data.streak+' days</div>';
  h += '</div>';
  return h;
}

function renderHomePracticeCard(data){
  var h = '<div class="card">';
  h += '<div><b>Today\'s Practice</b></div>';
  var plan = data.todayPlan || [];
  if(!plan.length){
    h += '<div>No plan yet.</div>';
  }
  for(var i=0;i<Math.min(plan.length,3);i++){
    h += '<div>'+escHTML(plan[i].title || plan[i].id || "Item "+(i+1))+'</div>';
  }
  h += '<button onclick="act(\'openPracticePlan\')">Open Plan</button>';
  h += '</div>';
  return h;
}

function renderHomeRecommendationCard(arr){
  var h = '<div class="card">';
  h += '<div><b>Recommended Next</b></div>';
  for(var i=0;i<Math.min(arr.length,3);i++){
    h += '<div>'+escHTML(arr[i].title)+'</div>';
  }
  h += '<button onclick="act(\'openRecommendations\')">View</button>';
  h += '</div>';
  return h;
}

function renderHomeChallengeCard(arr){
  var h = '<div class="card">';
  h += '<div><b>Challenges</b></div>';
  for(var i=0;i<arr.length;i++){
    h += '<div>'+escHTML(arr[i].title)+' '+arr[i].progress+'/'+arr[i].target+'</div>';
  }
  h += '<button onclick="act(\'openChallengeHub\')">Open</button>';
  h += '</div>';
  return h;
}

function renderHomeCareerCard(data){
  var h = '<div class="card">';
  h += '<div><b>Career</b></div>';
  if(data.nextSong){
    var songDef = typeof getCareerItem === "function" ? getCareerItem("songs", data.nextSong) : null;
    h += '<div>Next: '+escHTML(songDef ? songDef.title : data.nextSong)+'</div>';
    h += '<button onclick="act(\'openCareer\')">Open Career</button>';
  }else{
    h += '<div>All caught up!</div>';
  }
  h += '</div>';
  return h;
}

function renderHomePackCard(data){
  var packs = (data && data.packs) || {};
  var h = '<div class="card">';
  h += '<div><b>Packs</b></div>';
  var any = false;
  for(var id in packs){
    any = true;
    h += '<div>'+escHTML(id)+' '+Math.round((packs[id].progress||0)*100)+'%</div>';
  }
  if(!any) h += '<div>No packs started.</div>';
  h += '</div>';
  return h;
}

function renderHomeInsightCard(data){
  var h = '<div class="card">';
  h += '<div><b>Insights</b></div>';
  var strong = (data && data.strongestSkills) || [];
  if(strong.length){
    h += '<div>Top skill: '+escHTML(strong[0].bucket+': '+strong[0].id)+'</div>';
  }else{
    h += '<div>Practice more to see insights.</div>';
  }
  h += '<button onclick="act(\'openInsights\')">View All</button>';
  h += '</div>';
  return h;
}

function renderHomeEventCard(data){
  var h = '<div class="card">';
  h += '<div><b>Events</b></div>';
  if(data && data.title){
    h += '<div>'+escHTML(data.title)+'</div>';
  }else{
    h += '<div>No active event.</div>';
  }
  h += '</div>';
  return h;
}

function renderHomeSystemCard(data){
  var h = '<div class="card">';
  h += '<div><b>System</b></div>';
  h += '<div>Version: '+escHTML(data.version)+'</div>';
  h += '<div>Cloud: '+escHTML(data.cloudStatus)+'</div>';
  h += '</div>';
  return h;
}
