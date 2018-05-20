import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {TodoListData} from '../dataTypes/TodoListData';
import {TodoItemData} from '../dataTypes/TodoItemData';
import {TodoService} from '../todo.service';
import {forEach} from '@angular/router/src/utils/collection';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/switchMap';


@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit, AfterViewInit {
  public show = false;
  public des: any = 'Cliquer ici pour dessiner';
  @Input() private data: TodoListData;
  @Input() public width = 500;
  @Input() public height = 500;
  @ViewChild('canvas') public canvas: ElementRef;

  private cx: CanvasRenderingContext2D;

  private filterAll: FCT_FILTER_ITEMS = () => true;

  private filterDone: FCT_FILTER_ITEMS = item => item.isDone;

  private UnDone: FCT_FILTER_ITEMS = item => !item.isDone;

  private currentFilter = this.filterAll;

  constructor(private todoService: TodoService) {
  }

  ngOnInit() {
  }
  public Dessiner() {
    this.show = !this.show;
    if (this.show) {
      this.des = 'Dessiner dessous';
    } else {
      this.des = 'Cliquer ici pour dessiner';
    }
  }
  public ngAfterViewInit() {
    // obtention du contexte
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    // largeur et longueur
    canvasEl.width = this.width;
    canvasEl.height = this.height;

    // apparence du dessin
    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    this.captureEvents(canvasEl);
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    Observable
      .fromEvent(canvasEl, 'mousedown')
      .switchMap((e) => {
        return Observable
          .fromEvent(canvasEl, 'mousemove')
          .takeUntil(Observable.fromEvent(canvasEl, 'mouseup'))
          .takeUntil(Observable.fromEvent(canvasEl, 'mouseleave'))
          .pairwise();
      })
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };

        this.drawOnCanvas(prevPos, currentPos);
      });
  }


  private drawOnCanvas(
    prevPos: { x: number, y: number },
    currentPos: { x: number, y: number }
  ) {
    if (!this.cx) { return; }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);

      this.cx.stroke();
    }
  }

  private Erase() {
    this.cx.clearRect(0 , 0, 1000, 1000 );
  }

  private enregistrerDessin() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const dataURL = canvas.toDataURL('image/png');
    this.appendItems(dataURL);
  }


  getLabel(): string {
    return this.data ? this.data.label : '';
  }

  getItems(): TodoItemData[] {
    return this.data ? this.data.items : [];
  }

  appendItems(itemLabel: string) {

    this.todoService.appendItems({
      label: itemLabel,
      isDone: false,
    });

  }

  removeItems(item: TodoItemData) {

    this.todoService.removeItems(item);

  }


  setItemDone(item: TodoItemData, isDone: boolean) {

    this.todoService.setItemsDone(isDone, item);

  }


  NbitemsUnchecked(): number {

    return this.data.items.reduce(
      (acc, item) => acc + (item.isDone ? 0 : 1), 0
    );

  }

  getFiltereditems(): TodoItemData[] {

    return this.getItems().filter(this.currentFilter);
  }


  isAllDone(): boolean {

    return this.getItems().reduce(
      (acc, item) => acc && item.isDone, true
    );

  }


  removeDone() {

    for (const item of this.getItems()) {
      if (item.isDone) {
        this.removeItems(item);
      }


    }
  }

  toggleAllDone() {

    const done = !this.isAllDone();

    this.todoService.setItemsDone( done, ...this.data.items );

  }


}

type FCT_FILTER_ITEMS = (item: TodoItemData) => boolean;
