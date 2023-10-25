import { AxiosResponse } from 'axios';
import { all, call, CallEffect, put, PutEffect, takeLatest } from 'redux-saga/effects';
import { IFloorPlan } from 'ui-floorplan-react';

import { fetchFloorplan } from '../../services/floorPlanService';
import { fetchFloorPlanFailure, fetchFloorPlanSuccess, floorPlanActionType } from '../actions/floorPlan';

type WhatYouYield = PutEffect | CallEffect;
type WhatYouReturn = void;
type WhatYouAccept = AxiosResponse<IFloorPlan>;

function* fetchFloorPlanSaga(): Generator<WhatYouYield, WhatYouReturn, WhatYouAccept> {
  try {
    const response = yield call(fetchFloorplan);
    yield put(
      fetchFloorPlanSuccess({
        floorplan: response.data,
      }),
    );
  } catch (e) {
    yield put(
      fetchFloorPlanFailure({
        error: (e as Error).message,
      }),
    );
  }
}

function* floorPlanSaga() {
  yield all([takeLatest(floorPlanActionType.FETCH_FLOORPLAN_REQUEST, fetchFloorPlanSaga)]);
}

export default floorPlanSaga;
