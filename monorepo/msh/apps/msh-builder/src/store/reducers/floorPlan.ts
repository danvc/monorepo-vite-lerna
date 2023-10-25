import { IFloorPlan } from 'ui-floorplan-react';

import { FloorPlanActions, floorPlanActionType } from '../actions/floorPlan';

const emptyFloorPlan: IFloorPlan = {
  id: '',
  corners: [],
  walls: [],
};

export interface FloorPlanState {
  pending: boolean;
  floorplan: IFloorPlan;
  error: any;
}

const initialState: FloorPlanState = {
  pending: false,
  floorplan: emptyFloorPlan,
  error: null,
};

export default (state = initialState, action: FloorPlanActions) => {
  switch (action.type) {
    case floorPlanActionType.FETCH_FLOORPLAN_REQUEST:
      return {
        ...state,
        pending: true,
      };
    case floorPlanActionType.FETCH_FLOORPLAN_SUCCESS:
      return {
        ...state,
        pending: false,
        floorplan: action.payload.floorplan,
        error: null,
      };
    case floorPlanActionType.FETCH_FLOORPLAN_FAILURE:
      return {
        ...state,
        pending: false,
        floorplan: emptyFloorPlan,
        error: action.payload.error,
      };
    default:
      return { ...state };
  }
};
