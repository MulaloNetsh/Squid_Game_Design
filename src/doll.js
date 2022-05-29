import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

class Doll  
{
  constructor(state) 
  {
    this.dollState=state;
  }

  getState()
  {
    return this.dollState;
  }

  setState(state)
  {
   this.dollState=state;
  }

}

export { Doll };
