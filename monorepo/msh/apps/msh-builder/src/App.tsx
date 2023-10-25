import { useEffect, useState } from 'react';
import { SiFlathub } from 'react-icons/si';
import { TbPolygon } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { FloorPlan2D, FloorPlan3D, IFloorPlan } from 'ui-floorplan-react';
import {
  DEFAULT_TOOLBAR_HEIGHT,
  FullSizeLayout,
  LightTheme,
  SplitPanel,
  SplitView,
  StyledIconButton,
  Tab,
  Tabs,
  Toolbar,
  ToolbarContextProvider,
  ViewStyle,
} from 'ui-neumorphic-react';

import { FetchFloorPlanRequest, fetchFloorPlanRequest } from './store/actions/floorPlan';
import { RootState } from './store/store';

interface StyledAppContainerProps {}

const StyledAppContainer = styled.div<StyledAppContainerProps>`
  text-align: center;
  background: ${(props) => props.theme.greyLight1};
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DEFAULT_TAB_HEIGHT = 48;

const View2DButton = styled(StyledIconButton)`
  top: 34px;
  right: 20px;
  position: absolute;
  background-color: ${(props) => props.theme.greyLight1};
`;
const View3DButton = styled(StyledIconButton)`
  top: 74px;
  right: 20px;
  position: absolute;
  background-color: ${(props) => props.theme.greyLight1};
`;

const MODE_2D = 0;
const MODE_3D = 1;

function App() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState(MODE_2D);

  const { pending, floorplan, error } = useSelector((state: RootState) => state.floorPlan);

  useEffect(() => {
    dispatch(fetchFloorPlanRequest());
  }, []);

  const handleResizeEnd = (name: string, sizes: number[]): void => {
    // console.log('Size changed', name, sizes);
  };

  const tabs = [
    {
      id: 'tab1',
      label: 'Tab #1',
      selected: true,
      value: '0',
    },
    {
      id: 'tab2',
      label: 'Tab #2',
      value: '1',
    },
    {
      id: 'tab3',
      label: 'Tab #3',
      value: '2',
    },
  ];

  const onTabChange = (value: string | number): void => {
    console.log(`Change selected tab: ${value}`);
  };

  const onFloorPlanChange = (floorplan: IFloorPlan): void => {
    console.log('FloorPlan changed', floorplan);
  };

  const defaultTheme = LightTheme;

  return (
    <ThemeProvider theme={defaultTheme}>
      <ToolbarContextProvider>
        <FullSizeLayout>
          <SplitView split={ViewStyle.vertical} onResizeEnd={(sizes: number[]) => handleResizeEnd('left', sizes)}>
            <SplitPanel minSize={`${DEFAULT_TAB_HEIGHT}px`} initialSize="300px">
              <Tabs align={ViewStyle.vertical} name="leftPanel" onChange={onTabChange}>
                <Tab name="Events2">This is panel #1 content</Tab>
                <Tab name="Devices2">This is panel #2 content</Tab>
              </Tabs>
            </SplitPanel>
            <SplitPanel>
              <SplitView
                split={ViewStyle.horisontal}
                onResizeEnd={(sizes: number[]) => handleResizeEnd('bottom', sizes)}
              >
                <SplitPanel>
                  <StyledAppContainer style={{ alignItems: 'center' }}>
                    {mode === MODE_2D && <FloorPlan2D onChange={onFloorPlanChange} floorplan={floorplan} />}
                    {mode === MODE_3D && <FloorPlan3D />}
                  </StyledAppContainer>

                  <View2DButton size="small" primary={mode === MODE_2D}>
                    <TbPolygon onClick={() => setMode(MODE_2D)} />
                  </View2DButton>
                  <View3DButton size="small" primary={mode === MODE_3D}>
                    <SiFlathub onClick={() => setMode(MODE_3D)} />
                  </View3DButton>
                </SplitPanel>
                <SplitPanel minSize={`${DEFAULT_TAB_HEIGHT}px`} initialSize="300px">
                  <Tabs align={ViewStyle.horisontal} name="bottomPanel" onChange={onTabChange}>
                    <Tab name="Events">This is panel #1 content</Tab>
                    <Tab width="14" name="Devices Long Label">
                      This is panel #2 content
                    </Tab>
                    <Tab name="Other">This is panel #3 content</Tab>
                  </Tabs>
                </SplitPanel>
              </SplitView>
            </SplitPanel>
            <SplitPanel
              align="left"
              minSize={`${DEFAULT_TOOLBAR_HEIGHT}px`}
              maxSize={`${DEFAULT_TOOLBAR_HEIGHT}px`}
              initialSize={`${DEFAULT_TOOLBAR_HEIGHT}px`}
            >
              <Toolbar align={ViewStyle.vertical} name="rightPanel" />
            </SplitPanel>
          </SplitView>
        </FullSizeLayout>
      </ToolbarContextProvider>
    </ThemeProvider>
  );
}

export default App;
function dispatch(arg0: FetchFloorPlanRequest) {
  throw new Error('Function not implemented.');
}
