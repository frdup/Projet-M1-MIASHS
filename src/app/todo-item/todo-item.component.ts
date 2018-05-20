import {ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {TodoItemData} from '../dataTypes/TodoItemData';
import {TodoService} from '../todo.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {sanitizeUrl} from '@angular/platform-browser/src/security/url_sanitizer';

// alt+entrée en cliquant dessus pour importer un component

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})



export class TodoItemComponent implements OnInit {

  @Input() private data: TodoItemData;
  @ViewChild('newTextInput') newTextInput: ElementRef;

  isVideo = false;
  videoUrl: string;
  isYoutubeVideo = false;
  isDailymotionVideo = false;
  safeVideoUrl: SafeResourceUrl;
  isImage = false;
  imageUrl: string;
  safeImageUrl: SafeResourceUrl;
  isSound = false;
  soundUrl: string;
  safeSoundUrl: SafeResourceUrl;
  isEditing = false;


  constructor(private todoService: TodoService, private sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.setSafeVideoUrl();
    this.setSafeImageUrl();
    this.setUrlSound();
  }



  getLabel(): String {

    return this.data.label;

  }

  setLabel(label: string) {

    this.todoService.setItemsLabel(label, this.data);

  }


  public getisDone(): Boolean {

return this.data.isDone;

  }

   setDone(isDone: boolean) {

    this.todoService.setItemsDone(isDone, this.data);

   }

  remove() {

    this.todoService.removeItems(this.data);
  }

  setIsEditing(value: boolean) {

    this.isEditing = value;

    if (value) {

      requestAnimationFrame(
        () => this.newTextInput.nativeElement.focus()
      );
    }

  }

  getisEditing(): Boolean {

    return this.isEditing;
  }

  isUrl(s) {
    const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s) || s.includes('data:image/png');
  }

  checkImageUrl(url): boolean {
    if (this.isUrl(url) ) {
      return (url.includes('jpg') || url.includes('png') || url.includes('gif') || url.includes('jpeg') );
    }
  }

  checkSoundUrl(url): boolean {
    if (this.isUrl(url) ) {
      return (url.includes('mp3') || url.includes('ogg') || url.includes('mp4') );
    }
  }

  YouTubeGetID(url) {
    url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return undefined !== url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
  }

  DailymotionGetID(url) {
    const ret = [];
    const re = /(?:dailymotion\.com(?:\/video|\/hub)|dai\.ly)\/([0-9a-z]+)(?:[\-_0-9a-zA-Z]+#video=([a-z0-9]+))?/g;
    let m;
    while ((m = re.exec(url)) != null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      ret.push(m[2] ? m[2] : m[1]);
    }
    return ret;
  }

  getisYoutubeVideo(): Boolean {
    if (this.data.label.includes('www.youtube.com') && this.isUrl(this.data.label)) {
      this.isYoutubeVideo = true;
    }
    return this.isYoutubeVideo;
  }

  getisDailymotionVideo(): Boolean {
    if (this.data.label.includes('www.dailymotion.com') && this.isUrl(this.data.label)) {
      this.isDailymotionVideo = true;
    }
    return this.isDailymotionVideo;
  }



  setSafeVideoUrl() {
    if (this.getisYoutubeVideo() ) {
      this.isVideo = true;
      this.videoUrl = 'https://www.youtube.com/embed/' + this.YouTubeGetID(this.data.label);
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
    } else if (this.getisDailymotionVideo() ) {
      this.isVideo = true;
      this.videoUrl = 'https://www.dailymotion.com/embed/video/' + this.DailymotionGetID(this.data.label);
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
    }

    }


  getUrlIsImage(): boolean {
    if (!this.getisYoutubeVideo() && !this.getisDailymotionVideo() ) {
  if (this.checkImageUrl(this.data.label) ) {
  this.isImage = true;
   }
  }
return this.isImage;
}

  setSafeImageUrl() {
  if (this.getUrlIsImage()) {
    this.imageUrl = this.data.label;
    this.safeImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.imageUrl);
  }
}

  getUrlIsSound(): boolean {
  if (!this.getisYoutubeVideo() && !this.getisDailymotionVideo() && !this.getUrlIsImage() ) {
    if (this.checkSoundUrl(this.data.label)) {
      this.isSound = true;
    }
  }
  return this.isSound;
}

  setUrlSound() {

    if (this.getUrlIsSound() ) {
      this.soundUrl = this.data.label;
      this.safeSoundUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.soundUrl);
    }

}

    getisVideo(): boolean {
    return this.isVideo;
    }

    getSafeVideoUrl(): SafeResourceUrl {
      return this.safeVideoUrl;
    }

    getisImage(): boolean {
        return this.isImage;
      }

      getisSound(): boolean {
  return this.isSound;
}




}


