import { combineReducers } from 'redux';

import { default as floorPlanReducer, FloorPlanState } from './floorPlan';

export interface State {
  floorPlan: FloorPlanState;
}

const rootReducer = combineReducers<State>({
  floorPlan: floorPlanReducer,
});

export default rootReducer;
