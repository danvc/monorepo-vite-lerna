import {
  AmbientLightProps,
  GroupProps,
  MeshBasicMaterialProps,
  MeshProps,
  PlaneGeometryProps,
} from '@react-three/fiber';

export const Group: React.FC<GroupProps> = ({ children, ...props }) => {
  return <group {...props}>{children}</group>;
};

export const Mesh: React.FC<MeshProps> = ({ children, ...props }) => {
  return <mesh {...props}>{children}</mesh>;
};

export const MeshBasicMaterial: React.FC<MeshBasicMaterialProps> = ({ children, ...props }) => {
  return <meshBasicMaterial {...props}>{children}</meshBasicMaterial>;
};

export const PlaneGeometry: React.FC<PlaneGeometryProps> = ({ children, ...props }) => {
  return <planeGeometry {...props}>{children}</planeGeometry>;
};

export const AmbientLight: React.FC<AmbientLightProps> = ({ children, ...props }) => {
  return <ambientLight {...props}>{children}</ambientLight>;
};
