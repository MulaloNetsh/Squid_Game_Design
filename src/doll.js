//This class handles the states of the doll
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
