import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
class ThirdPersonCamera {
    constructor(params) {
      this._params = params;
      this._camera = params.camera;
  
      this._currentPosition = new THREE.Vector3(); // set currentPostion vector to (0,0,0)
      this._currentLookat = new THREE.Vector3();  // set currentLookAt vector to (0,0,0)
    }
  
    /* _CalculateIdealOffset() set the postion of thirdPersonCamera(idealOffset)
       applyQuaternion,the camera changes with any movement(rotation or moving forward/backward)
       then adds targets position on idealOffset
        return the idealOffset
    */
    _CalculateIdealOffset() {
      const idealOffset = new THREE.Vector3(10, 15, -30);
      idealOffset.applyQuaternion(this._params.target.Rotation);
      idealOffset.add(this._params.target.Position);
      return idealOffset;
    }
  


    /**  _CalculateIdealLookAt() set where the thirdPersonCamera should focus(LookAt)
         applyQuaternion and add, similar to _CalculateIdealOffset()
         return _idealLookAt
    */
    _CalculateIdealLookat() {
      const idealLookat = new THREE.Vector3(0, 10, 50);
      idealLookat.applyQuaternion(this._params.target.Rotation);
      idealLookat.add(this._params.target.Position);
      return idealLookat;
    }


    /* Update() set the position and LookAt camera vectors
       set time t using timeElapsed
       given the idealOffset and t , it lerps t times to get the currentPostion
       same for ideaLookAt and t to get currentLookAt
      then set camera position and camera lookAt currentPosition and currentLookat
    */
    Update(timeElapsed) {
      const idealOffset = this._CalculateIdealOffset();
      const idealLookat = this._CalculateIdealLookat();
  
      const t = 1.0 - Math.pow(0.001, timeElapsed);
  
      this._currentPosition.lerp(idealOffset, t);
      this._currentLookat.lerp(idealLookat, t);
  
      this._camera.position.copy(this._currentPosition);
      this._camera.lookAt(this._currentLookat);
    }
  };
  export{ThirdPersonCamera};
