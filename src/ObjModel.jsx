import React, { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { MTLLoader, OBJLoader } from 'three-stdlib';

export default function ObjModel({ path, mtlName, objName, ...props }) {
  const materials = useLoader(MTLLoader, `${path}/${mtlName}`);
  const [model, setModel] = useState();

  useEffect(() => {
    materials.preload();
    const loader = new OBJLoader().setMaterials(materials);
    loader.load(`${path}/${objName}`, setModel);
    return () => setModel(undefined);
  }, [materials, objName, path]);

  return model ? <primitive object={model} {...props} /> : null;
}
