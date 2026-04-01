/* ───────── PianoSpark – curriculum/curriculum_loader.js ───────── */
/* Loads curriculum data from JSON files */
(function(){

  async function loadCurriculumManifest(path){
    var res = await fetch(path);
    return await res.json();
  }

  async function loadCurriculumFile(path){
    var res = await fetch(path);
    var data = await res.json();
    return data;
  }

  async function loadFullCurriculum(manifestPath){
    var manifest = await loadCurriculumManifest(manifestPath);
    if(manifest.curriculums){
      registerCurriculum("curriculums", await loadCurriculumFile(manifest.curriculums));
    }
    if(manifest.tracks){
      registerCurriculum("tracks", await loadCurriculumFile(manifest.tracks));
    }
    if(manifest.units){
      registerCurriculum("units", await loadCurriculumFile(manifest.units));
    }
    if(manifest.lessons){
      registerCurriculum("lessons", await loadCurriculumFile(manifest.lessons));
    }
    return manifest;
  }

  window.loadFullCurriculum = loadFullCurriculum;

})();
