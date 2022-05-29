let text = document.querySelector(".text");
class GameLogic{
    constructor(dollState,playerState,gameState,playerPositionZ,timeLeft)
    {
        this.dollState=dollState;
        this.playerState=playerState;
        this.gameState=gameState;
        this.playerPositionZ=playerPositionZ;
        this.checkpointZ=-100;
        this.timeLeft=timeLeft;
    }

    check()
    {
        if(this.dollState=='redLight' && (this.playerState=='walk' ||this.playerState=='run' || this.playerState=='dance'))
        {
            this.gameState=='over';
            text.innerText='GAME OVER!'
        }
        if(this.timeLeft==0 && this.playerPositionZ!=-100 )
        {
            this.gameState=='over';
            text.innerText='GAME OVER!'
        }
    }
}
export {GameLogic};