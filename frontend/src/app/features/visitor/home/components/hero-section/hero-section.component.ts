import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero-section.component.html',
  host: { style: 'display:block;height:100%' }
})
export class HeroSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgVideo') videoRef!: ElementRef<HTMLVideoElement>;
  private hostRef = inject(ElementRef);
  private observer!: IntersectionObserver;

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );

    this.observer.observe(this.hostRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
