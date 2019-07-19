import {Component, OnInit} from '@angular/core';
import {CacheBuster, Cached} from '../decorators/cacheable.decorator';
import {HttpClient} from '@angular/common/http';
import {interval, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {CacheLogger} from '../interfaces/Icacheable-metadata.interface';

export class CacheLoggerTest implements CacheLogger {
  log = (payload: any) => {
  };
}

const loggerTest = new CacheLoggerTest();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'ng-cacheable';

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    interval(1000).subscribe(() => {
      this.testMethod().pipe(
        catchError(err => {
          return of(null);
        })
      ).subscribe();
    });

    interval(15000).subscribe(_ => {
      this.bustMethod().subscribe();
    });
  }

  @Cached({
    cacheBustingKey: 'pippo',
    cacheTTL: 30 * 1000,
  })
  testMethod() {
    return this.http.get('http://www.mocky.io/v2/5cefb6063000001b303cd250');
  }

  @CacheBuster({
    cacheBusterFor: 'pippo',
  })
  bustMethod() {
    return this.http.get('http://www.mocky.io/v2/5cefb6063000001b303cd250');
  }

}
