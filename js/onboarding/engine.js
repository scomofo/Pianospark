/* PianoSpark – onboarding/engine.js */
/* Onboarding flow progression engine */
(function(){
  function startOnboarding(){
    markOnboardingStarted();
    S.screen = SCR.ONBOARDING_FLOW;
    if(!S.onboardingFlow.currentStep){
      S.onboardingFlow.currentStep = "welcome";
    }
    render();
  }

  function continueOnboarding(){
    if(isOnboardingFlowComplete()){
      S.screen = SCR.HOME_DASH;
      render();
      return;
    }
    S.screen = SCR.ONBOARDING_FLOW;
    render();
  }

  function goToNextOnboardingStep(){
    var cur = getCurrentOnboardingStep();
    var idx = getOnboardingStepIndex(cur);
    var arr = SparkOnboardingSteps || [];
    if(idx < 0 || idx >= arr.length - 1){
      finishOnboardingFlow();
      return;
    }
    setCurrentOnboardingStep(arr[idx + 1].id);
    render();
  }

  function goToPreviousOnboardingStep(){
    var cur = getCurrentOnboardingStep();
    var idx = getOnboardingStepIndex(cur);
    var arr = SparkOnboardingSteps || [];
    if(idx <= 0) return;
    setCurrentOnboardingStep(arr[idx - 1].id);
    render();
  }

  function finishOnboardingFlow(){
    runFinalOnboardingSetup();
    markOnboardingFlowComplete();
    S.screen = SCR.HOME_DASH;
    render();
  }

  function runFinalOnboardingSetup(){
    if(typeof generateDailyPracticePlan === "function") generateDailyPracticePlan();
    if(typeof generateRecommendations === "function") generateRecommendations();
    if(typeof generatePersonalInsights === "function") generatePersonalInsights();
    if(typeof initializeChallengesForCurrentCycle === "function") initializeChallengesForCurrentCycle();
  }

  function applyStarterUnlocksFromOnboarding(){
    var instrument = S.onboardingFlow.instrument;
    var level = S.onboardingFlow.skillLevel;
    if(instrument === "piano"){
      if(level === "beginner"){
        unlockStarterIds(["lesson_piano_intro_01","pack_beginner_piano_01","pack_block_chords_01"]);
      }else if(level === "early_intermediate"){
        unlockStarterIds(["pack_left_hand_01","pack_melody_basics_01"]);
      }else{
        unlockStarterIds(["pack_progressions_01","pack_accompaniment_01"]);
      }
    }
    if(instrument === "guitar"){
      if(level === "beginner"){
        unlockStarterIds(["lesson_open_chords_01","pack_beginner_open_chords_01","pack_beginner_songs_01"]);
      }else if(level === "early_intermediate"){
        unlockStarterIds(["pack_strumming_01","pack_beginner_songs_01","lesson_rhythm_intro_01"]);
      }else{
        unlockStarterIds(["pack_barre_intro_01","pack_rhythm_guitar_01"]);
      }
    }
    if(typeof markOnboardingStarterUnlocksDone === "function") markOnboardingStarterUnlocksDone();
  }

  function unlockStarterIds(ids){
    for(var i=0;i<ids.length;i++){
      if(typeof unlockContent === "function"){
        unlockContent("lessons", ids[i]);
        unlockContent("songs", ids[i]);
        unlockContent("exercises", ids[i]);
      }
    }
  }

  function generateInitialPracticePlanFromOnboarding(){
    if(typeof generateDailyPracticePlan !== "function") return null;
    return generateDailyPracticePlan();
  }

  function generateInitialRecommendationsFromOnboarding(){
    if(typeof generateRecommendations !== "function") return [];
    return generateRecommendations(S.onboardingFlow.instrument === "piano" ? "piano" : "guitar");
  }

  function handleInitialAppRouting(){
    if(!isOnboardingFlowComplete()){
      S.screen = SCR.ONBOARDING_FLOW;
      return;
    }
    if(!S.screen || S.screen === SCR.HOME){
      S.screen = SCR.HOME_DASH;
    }
  }

  window.startOnboarding = startOnboarding;
  window.continueOnboarding = continueOnboarding;
  window.goToNextOnboardingStep = goToNextOnboardingStep;
  window.goToPreviousOnboardingStep = goToPreviousOnboardingStep;
  window.finishOnboardingFlow = finishOnboardingFlow;
  window.runFinalOnboardingSetup = runFinalOnboardingSetup;
  window.applyStarterUnlocksFromOnboarding = applyStarterUnlocksFromOnboarding;
  window.generateInitialPracticePlanFromOnboarding = generateInitialPracticePlanFromOnboarding;
  window.generateInitialRecommendationsFromOnboarding = generateInitialRecommendationsFromOnboarding;
  window.handleInitialAppRouting = handleInitialAppRouting;
})();
