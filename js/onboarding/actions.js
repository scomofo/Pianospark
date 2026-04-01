/* PianoSpark – onboarding/actions.js */
/* Save onboarding answers and advance the flow */
(function(){
  function setOnboardingInstrument(value){
    S.onboardingFlow.instrument = value;
    saveState();
  }

  function setOnboardingSkillLevel(value){
    S.onboardingFlow.skillLevel = value;
    saveState();
  }

  function toggleOnboardingGoal(goal){
    var arr = S.onboardingFlow.goals || [];
    var idx = arr.indexOf(goal);
    if(idx >= 0){
      arr.splice(idx, 1);
    }else{
      arr.push(goal);
    }
    S.onboardingFlow.goals = arr;
    saveState();
  }

  function markOnboardingMidiSetupDone(){
    S.onboardingFlow.midiSetupDone = true;
    saveState();
  }

  function markOnboardingCalibrationDone(){
    S.onboardingFlow.calibrationDone = true;
    saveState();
  }

  function markOnboardingStarterUnlocksDone(){
    S.onboardingFlow.starterContentUnlocked = true;
    saveState();
  }

  window.setOnboardingInstrument = setOnboardingInstrument;
  window.setOnboardingSkillLevel = setOnboardingSkillLevel;
  window.toggleOnboardingGoal = toggleOnboardingGoal;
  window.markOnboardingMidiSetupDone = markOnboardingMidiSetupDone;
  window.markOnboardingCalibrationDone = markOnboardingCalibrationDone;
  window.markOnboardingStarterUnlocksDone = markOnboardingStarterUnlocksDone;
})();
