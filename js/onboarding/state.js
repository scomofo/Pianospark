/* PianoSpark – onboarding/state.js */
/* Onboarding state management */
(function(){
  function isOnboardingComplete(){
    return !!(S.onboardingFlow && S.onboardingFlow.completed);
  }

  function getCurrentOnboardingStep(){
    return (S.onboardingFlow && S.onboardingFlow.currentStep) || "welcome";
  }

  function setCurrentOnboardingStep(stepId){
    if(!S.onboardingFlow) return;
    S.onboardingFlow.currentStep = stepId;
    saveState();
  }

  function markOnboardingStarted(){
    if(!S.onboardingFlow) return;
    if(!S.onboardingFlow.startedAt){
      S.onboardingFlow.startedAt = Date.now();
    }
    saveState();
  }

  function markOnboardingFlowComplete(){
    if(!S.onboardingFlow) return;
    S.onboardingFlow.completed = true;
    S.onboardingFlow.completedAt = Date.now();
    S.firstRun = false;
    saveState();
  }

  function resetOnboarding(){
    S.onboardingFlow = {
      completed: false,
      startedAt: null,
      completedAt: null,
      currentStep: "welcome",
      instrument: null,
      skillLevel: null,
      goals: [],
      midiSetupDone: false,
      calibrationDone: false,
      starterContentUnlocked: false
    };
    S.firstRun = true;
    saveState();
  }

  window.isOnboardingFlowComplete = isOnboardingComplete;
  window.getCurrentOnboardingStep = getCurrentOnboardingStep;
  window.setCurrentOnboardingStep = setCurrentOnboardingStep;
  window.markOnboardingStarted = markOnboardingStarted;
  window.markOnboardingFlowComplete = markOnboardingFlowComplete;
  window.resetOnboarding = resetOnboarding;
})();
