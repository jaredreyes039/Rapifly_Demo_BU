import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private socket;

  constructor() {
    this.socket = io(environment.socketUrl);
  }

  //Send message from plan
  public sendMessage(data) {
    this.socket.emit('new-message', data);
  }

  //Get message for plan
  public getMessages = () => {
    return Observable.create((observer) => {
      this.socket.on('new-message', (data) => {
        observer.next(data.data);
      });
    });
  }

  //Send message for goal
  public sendGoalMessage(data) {
    this.socket.emit('goal-new-message', data);
  }

  //Get message for goal
  public getGoalMessages = () => {
    return Observable.create((observer) => {
      this.socket.on('goal-new-message', (data) => {
        observer.next(data.data);
      });
    });
  }

  //Send message for strategy
  public sendStrategyMessage(data) {
    this.socket.emit('strategy-new-message', data);
  }

  //Get message for strategy
  public getStrategyMessages = () => {
    return Observable.create((observer) => {
      this.socket.on('strategy-new-message', (data) => {
        observer.next(data.data);
      });
    });
  }

  //Send message for challange
  public sendChallangeMessage(data) {
    this.socket.emit('challange-new-message', data);
  }

  //Get message for challange
  public getChallangeMessages = () => {
    return Observable.create((observer) => {
      this.socket.on('challange-new-message', (data) => {
        observer.next(data.data);
      });
    });
  }
}
