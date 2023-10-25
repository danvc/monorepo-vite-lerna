import { all, fork } from 'redux-saga/effects';

import watchFloorPlanSaga from './floorPlan';

function* RootSaga() {
  yield all([fork(watchFloorPlanSaga)]);
}

export default RootSaga;
