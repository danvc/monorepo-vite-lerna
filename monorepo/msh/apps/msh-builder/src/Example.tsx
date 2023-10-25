import { useState } from 'react';
import { IoIosHome } from 'react-icons/io';
import styled, { ThemeProvider } from 'styled-components';
import {
  Button,
  FullSizeLayout,
  IconButton,
  LabeledInput,
  LightTheme,
  SplitPanel,
  SplitView,
  Tab,
  TabPanel,
  Tabs,
  ViewStyle,
  WidgetPanel,
} from 'ui-neumorphic-react';
import { TabInfo } from 'ui-neumorphic-react/src/components/layout/TabPanelView/TabPanel';

interface StyledAppContainerProps {}

const StyledAppContainer = styled.div<StyledAppContainerProps>`
  text-align: center;
  background: var(--greyLight-1);
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DEFAULT_TAB_HEIGHT = 48;

function App() {
  const [count, setCount] = useState(0);

  const handleResizeEnd = (name: string, sizes: number[]): void => {
    console.log('Size changed', name, sizes);
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

  return (
    <ThemeProvider theme={LightTheme}>
      <FullSizeLayout>
        <SplitView split={ViewStyle.vertical} onResizeEnd={(sizes: number[]) => handleResizeEnd('left', sizes)}>
          <SplitPanel minSize={`${DEFAULT_TAB_HEIGHT}px`} initialSize="300px">
            <Tabs align={ViewStyle.vertical} name="leftPanel" onChange={onTabChange}>
              <Tab name="Events2">This is panel #1 content</Tab>
              <Tab name="Devices2">This is panel #2 content</Tab>
            </Tabs>
          </SplitPanel>
          <SplitPanel>
            <SplitView split={ViewStyle.horisontal} onResizeEnd={(sizes: number[]) => handleResizeEnd('bottom', sizes)}>
              <SplitPanel>
                <StyledAppContainer style={{ alignItems: 'center' }}>
                  <WidgetPanel>
                    <WidgetPanel>
                      <Button primary size="small" onClick={() => setCount((count) => count + 1)}>
                        🪂 Click me : {count}
                      </Button>

                      <Button size="medium" onClick={() => setCount((count) => count + 1)}>
                        🪂 Click me : {count}
                      </Button>
                    </WidgetPanel>

                    <WidgetPanel>
                      <IconButton size="large">
                        <IoIosHome onClick={() => setCount((count) => count + 1)} />
                      </IconButton>

                      <IconButton size="medium">
                        <IoIosHome onClick={() => setCount((count) => count + 1)} />
                      </IconButton>

                      <IconButton size="small">
                        <IoIosHome onClick={() => setCount((count) => count + 1)} />
                      </IconButton>
                    </WidgetPanel>

                    <LabeledInput id="labeledInput1" label="What?" />
                  </WidgetPanel>
                </StyledAppContainer>
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
          <SplitPanel align="left" minSize={`${DEFAULT_TAB_HEIGHT}px`} initialSize="300px">
            <Tabs align={ViewStyle.vertical} horizontalAlign="right" name="rightPanel" onChange={onTabChange}>
              <Tab name="Properties">This is panel #1 content</Tab>
            </Tabs>
          </SplitPanel>
        </SplitView>
      </FullSizeLayout>
    </ThemeProvider>
  );
}

export default App;
