import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TodoService} from './todo.service';
import {TodoListData} from './dataTypes/TodoListData';
import {TodoItemData} from './dataTypes/TodoItemData';

 // décorateur : fonction qui s'applique sur des classes
 // template dans app.component.html

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

  private tdl: TodoListData;

  constructor(private todoService: TodoService) {

    todoService.getTodoListDataObserver().subscribe(
      // subscribe en bout de chaîne s'abonne au résultat :
      L => this.tdl = L
    // ou (L: TodoListData) => (this.tdl = L);
  );
  }

  getCurrentTodoList(): TodoListData {

    return this.tdl;

    }

  }


