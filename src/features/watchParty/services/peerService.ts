import Peer from 'peerjs';

class PeerService {
  peer: Peer | null = null;
  myStream: MediaStream | null = null;

  initialize(userId: string) {
    this.peer = new Peer(userId, {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
    });

    this.peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
    });
  }

  async getLocalStream() {
    try {
      this.myStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      return this.myStream;
    } catch (err) {
      console.error('Failed to get local stream', err);
      return null;
    }
  }

  callUser(peerId: string, stream: MediaStream) {
    if (!this.peer) return;
    const call = this.peer.call(peerId, stream);
    return call;
  }

  answerCall(call: any, stream: MediaStream) {
    call.answer(stream);
    return call;
  }

  destroy() {
    if (this.myStream) {
      this.myStream.getTracks().forEach(track => track.stop());
    }
    if (this.peer) {
      this.peer.destroy();
    }
  }
}

export const peerService = new PeerService();
