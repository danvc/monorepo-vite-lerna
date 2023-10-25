import { OrbitControls, PresentationControls } from '@react-three/drei';
import { Canvas, RootState } from '@react-three/fiber';
import React from 'react';
import { FC } from 'react';
import { AiFillFolderOpen } from 'react-icons/ai';
import { BiSave } from 'react-icons/bi';
import { TbPackgeExport } from 'react-icons/tb';
import styled from 'styled-components';
import { DoubleSide } from 'three';
import { ToolbarBtn, ToolbarGroup, useToolbarContext } from 'ui-neumorphic-react';

import { AmbientLight, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from './@core/types/Fiber';

const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 0;
`;

const Level: FC = () => {
  return (
    // The mesh is at the origin
    // Since it is inside a group, it is at the origin
    // of that group
    // It's rotated by 90 degrees along the X-axis
    // This is because, by default, planes are rendered
    // in the X-Y plane, where Y is the up direction
    <Mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
      {/*
        The thing that gives the mesh its shape
        In this case the shape is a flat plane
      */}
      <PlaneGeometry />
      {/*
        The material gives a mesh its texture or look.
        In this case, it is just a uniform green
      */}
      <MeshBasicMaterial color="green" side={DoubleSide} />
    </Mesh>
  );
};

interface FloorPlan3DState {}

interface FloorPlan3DProps {}

type Props = FloorPlan3DProps & {
  updateToolbar: (toolbarName: string, toolbar: React.ReactNode | React.ReactNode[]) => void;
  clearToolbar: (toolbarName: string) => void;
};
class FloorPlan3D extends React.Component<Props, FloorPlan3DState> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  componentDidMount(): void {
    this.props.updateToolbar('rightPanel', this.viewToolbar());
  }

  componentWillUnmount(): void {
    this.props.clearToolbar('rightPanel');
  }

  viewToolbar(): React.ReactNode | React.ReactNode[] {
    return [
      <ToolbarGroup key="ToolbarGroup1">
        <ToolbarBtn>
          <AiFillFolderOpen onClick={() => console.log('Load is not implemented!')} />
        </ToolbarBtn>
        <ToolbarBtn>
          <BiSave onClick={() => console.log('Save is not implemented!')} />
        </ToolbarBtn>
        <ToolbarBtn>
          <TbPackgeExport onClick={() => console.log('Save is not implemented!')} />
        </ToolbarBtn>
        TbPackgeExport
      </ToolbarGroup>,
    ];
  }

  onCanvasCreated(state: RootState) {
    console.log('Canvas created', state);
  }

  render(): JSX.Element {
    return (
      <Canvas
        flat
        dpr={[1, 2]}
        camera={{ fov: 25, position: [0, 0, 8] }}
        onCreated={(state: RootState) => this.onCanvasCreated(state)}
      >
        <AmbientLight />
        <PresentationControls
          global
          zoom={0.8}
          rotation={[0, -Math.PI / 4, 0]}
          polar={[0, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          {/*
              A group is used for grouping, kind og like
              groups in SVGs. The positioning of elements
              inside a group is relative to the group's
              position.
            */}
          <Group position-y={-0.75} dispose={null}>
            <Level />
          </Group>

          {/*
              This lets you rotate the camera.
              We've associated our React ref with it
              like we would do for any React component
            */}
          <OrbitControls />
        </PresentationControls>
        ;
      </Canvas>
    );
  }
}

const FloorPlan3DWrapper = (props: FloorPlan3DProps) => {
  const { showToolbar, clearToolbar } = useToolbarContext();

  return (
    <ViewerContainer>
      <CanvasContainer className="floorPlan3D">
        <FloorPlan3D {...props} updateToolbar={showToolbar} clearToolbar={clearToolbar} />
      </CanvasContainer>
    </ViewerContainer>
  );
};

export default FloorPlan3DWrapper;
