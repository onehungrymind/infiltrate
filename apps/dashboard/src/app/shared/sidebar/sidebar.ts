import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '@kasita/core-data';
import { LayoutService } from '../../services/layout.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Logo } from '../logo/logo';

const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>`;

const learningPathIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>`;

const knowledgeUnitIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
</svg>`;

const rawContentIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
</svg>`;

const sourceConfigIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
</svg>`;

const contentIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
</svg>`;

const challengesIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a6 6 0 100-12 6 6 0 000 12z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a3 3 0 100-6 3 3 0 000 6z" />
  <circle cx="12" cy="12" r="1" fill="currentColor" />
</svg>`;

const scheduleIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 005.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
</svg>`;

const graphIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
 <g transform="scale(0.1875)">
  <path d="m35.625 101.59c-1.1406-0.09375-2.5078-0.42969-3.6719-0.89063-2.8008-1.1172-5.1602-3.1992-6.6523-5.8789-0.8125-1.4609-1.3516-3.1758-1.5625-4.9922-0.070312-0.62109-0.058593-2.2305 0.019531-2.8711 0.375-2.9531 1.5977-5.5391 3.6055-7.6055 2.2305-2.2969 5.0664-3.6719 8.207-3.9766 0.64453-0.0625 2.5625-0.027344 3.0742 0.054687 1.4688 0.23828 2.5586 0.55859 3.7266 1.1016 0.42578 0.19531 0.39062 0.16406-0.15625-0.14453-0.26953-0.15234-0.43359-0.26562-0.42578-0.29687 0.019532-0.082032 14.852-26.031 14.879-26.031 0.015625 0 0.16016 0.078124 0.32422 0.17187 0.82422 0.46875 0.85937 0.48047 0.26172 0.074219-0.5625-0.38281-1.0195-0.76562-1.6367-1.3633-1.0977-1.0703-1.8672-2.1133-2.5625-3.4883-0.73047-1.4414-1.1445-2.8359-1.3477-4.5508-0.058593-0.49609-0.058593-2.2031 0-2.7227 0.45703-4.0039 2.5352-7.4258 5.8633-9.6445 1.7812-1.1914 3.9727-1.9414 6.1992-2.1211 0.6875-0.054687 2-0.027344 2.6367 0.054688 3 0.39844 5.582 1.6562 7.6797 3.7422 3.832 3.8125 4.9336 9.4961 2.8125 14.516-0.64844 1.5352-1.6367 2.9688-2.8906 4.1953-0.64062 0.62891-1.1875 1.0781-1.8203 1.5-0.23438 0.15625-0.44531 0.30078-0.46484 0.32031-0.042968 0.039063 0.83203-0.41406 0.90234-0.46875 0.03125-0.023437 0.0625-0.007812 0.097656 0.050781 0.03125 0.046876 1.3203 2.4453 2.8711 5.3281 1.5508 2.8828 4.6406 8.6289 6.8672 12.77 2.2266 4.1406 4.0508 7.543 4.0508 7.5586 0 0.015626-0.22656 0.15234-0.50391 0.30078-0.5 0.26953-0.67578 0.39844-0.25781 0.1875 0.32812-0.16406 1.3008-0.51562 1.8359-0.66406 0.67969-0.1875 1.4688-0.33984 2.1289-0.41016 0.74609-0.078125 2.5977-0.058594 3.207 0.039063 2.0859 0.33203 3.7266 0.94531 5.4062 2.0273 1.3828 0.89062 2.7422 2.2266 3.6875 3.625 2.2305 3.293 2.8594 7.3945 1.7188 11.188-1.2266 4.0781-4.4297 7.3672-8.4766 8.707-2.8828 0.95313-6.1445 0.86328-8.9375-0.24609-2.5703-1.0195-4.7422-2.8008-6.2383-5.1055-0.89844-1.3828-1.5391-2.9609-1.8516-4.5508-0.10938-0.55469-0.21484-1.3242-0.23828-1.7461-0.007813-0.11328-0.015626 0.066406-0.019532 0.40234l-0.007812 0.60547h-27.969l-0.007813-0.60547c-0.003906-0.33203-0.011719-0.53906-0.019531-0.45703-0.15234 1.8633-0.51172 3.2695-1.2383 4.8438-1.2227 2.6445-3.5781 4.9961-6.2695 6.2617-1.4336 0.67578-2.9141 1.0703-4.5508 1.2188-0.49219 0.042969-1.7461 0.042969-2.293-0.003906zm2.6016-3.7773c2.1016-0.33984 3.8633-1.2344 5.3164-2.707 1.4648-1.4844 2.3594-3.3125 2.6602-5.4648 0.074219-0.51562 0.058594-1.9531-0.023437-2.4805-0.32031-2.0664-1.1641-3.7852-2.5664-5.2422-1.4883-1.5469-3.3633-2.4883-5.5703-2.8008-0.625-0.089843-1.8594-0.089843-2.4609 0-1.7695 0.25781-3.2812 0.90625-4.6602 1.9961-0.37109 0.29297-1.1523 1.082-1.4805 1.4961-1.0586 1.3438-1.6875 2.8008-1.957 4.5508-0.082031 0.53906-0.09375 1.9688-0.019531 2.5 0.24609 1.75 0.90625 3.3125 1.9648 4.6602 1.5508 1.9727 3.8789 3.2656 6.3789 3.543 0.45312 0.050781 1.9844 0.015625 2.418-0.050781zm54.293 0c2.0352-0.31641 3.8672-1.2383 5.2852-2.6602 1.5039-1.5078 2.3945-3.3242 2.707-5.5078 0.074219-0.51172 0.058593-1.9492-0.023438-2.4805-0.26562-1.7109-0.89062-3.1836-1.918-4.5078-0.29687-0.38672-1.1562-1.2539-1.5195-1.5391-1.3945-1.0977-2.8828-1.7344-4.6602-1.9961-0.66797-0.097657-1.918-0.089844-2.6094 0.015624-3.3555 0.51563-6.1445 2.7031-7.3789 5.7852-0.49219 1.2305-0.67578 2.1758-0.67578 3.5234-0.003906 1.3516 0.18359 2.3477 0.65234 3.5312 1.2773 3.2109 4.2891 5.5 7.7344 5.8828 0.45703 0.050781 1.9492 0.015625 2.4062-0.054688zm-28.527-11.211h13.984l0.007813 0.625c0.003906 0.34375 0.011719 0.53125 0.019531 0.41797 0.074219-1.2344 0.41406-2.7773 0.87109-3.9336 0.67188-1.707 1.5781-3.1094 2.8516-4.4141 0.70703-0.72266 1.3906-1.293 2.1719-1.8125 0.14844-0.097657 0.26953-0.1875 0.26953-0.19531 0-0.015625-0.77734 0.39062-0.84766 0.44531-0.03125 0.023437-0.0625 0.003906-0.097656-0.050781-0.03125-0.046876-1.5586-2.8906-3.4023-6.3164-1.8398-3.4258-4.9297-9.1719-6.8672-12.766s-3.5195-6.5508-3.5195-6.5703c0-0.019532 0.21094-0.14844 0.46484-0.28516 0.25781-0.13672 0.46094-0.25781 0.45312-0.26563-0.007812-0.007812-0.14453 0.046876-0.30469 0.11719-0.92578 0.42188-2.2539 0.79297-3.4883 0.97266-0.625 0.09375-2.4922 0.11328-3.1719 0.035156-1.3359-0.15234-2.8203-0.54687-3.832-1.0156-0.66797-0.30859-0.6875-0.30078-0.09375 0.042968 0.22656 0.12891 0.39844 0.25 0.39062 0.27734-0.011718 0.054688-14.805 25.961-14.852 26.012-0.015625 0.019531-0.22656-0.078125-0.47266-0.21875-0.625-0.35938-0.625-0.35938-0.042969 0.054687 0.85156 0.60938 1.9492 1.6484 2.6172 2.4805 1.3594 1.6953 2.2695 3.6719 2.6719 5.8164 0.082031 0.44141 0.18359 1.25 0.19531 1.5859 0.003906 0.11328 0.011719-0.074219 0.019531-0.41797l0.011719-0.625zm7.6836-35.824c0-0.011719-0.035156 0-0.074219 0.019531-0.042968 0.023437-0.074218 0.046875-0.074218 0.058593 0 0.011719 0.035156 0 0.074218-0.019531 0.042969-0.023437 0.074219-0.046875 0.074219-0.058593zm-5.7422-1.8828c3.8203-0.42188 7.0625-3.2656 8.0195-7.0312 0.22266-0.88281 0.27734-1.3242 0.27734-2.3125 0-1.0977-0.097657-1.8086-0.375-2.7305-1.207-3.9883-4.8516-6.7227-8.9648-6.7227-1.8398 0-3.4727 0.44531-4.9727 1.3594-2.5547 1.5547-4.2344 4.2578-4.5039 7.2578-0.054687 0.59375-0.027343 1.5859 0.058594 2.1641 0.53125 3.5898 3.0352 6.5391 6.4922 7.6445 0.67578 0.21484 1.2891 0.33203 2.2344 0.42578 0.23828 0.023438 1.3477-0.011718 1.7344-0.054687z" fill="currentColor"/>
 </g>
</svg>`;

const usersIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
</svg>`;

const visualizationIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
</svg>`;

const notebookIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
</svg>`;

const learningMapIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
</svg>`;

const studyIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
</svg>`;

const principlesIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
</svg>`;

const assessmentIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
</svg>`;

const submissionsIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
</svg>`;

const projectsIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44Z" />
</svg>`;

const mentorIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
</svg>`;

interface NavSection {
  title?: string;
  routes: NavRoute[];
  collapsed: boolean;
}

interface NavRoute {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, Logo],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit, OnDestroy {
  protected isMobileSidebarOpen = false;
  protected isSidebarCollapsed = false;
  private authService = inject(AuthService);
  private layoutService = inject(LayoutService);
  private sanitizer = inject(DomSanitizer);
  private destroy$ = new Subject<void>();

  protected sections: NavSection[] = [
    {
      routes: [
        { label: 'Home', path: '/', icon: 'home' },
        { label: 'Study', path: '/study', icon: 'study' },
        { label: 'Content', path: '/content', icon: 'content' },
        { label: 'Challenges', path: '/challenges', icon: 'challenges' },
        { label: 'Projects', path: '/projects', icon: 'projects' },
        { label: 'Schedule', path: '/schedule', icon: 'schedule' },
      ],
      collapsed: false,
    },
    {
      title: 'Features',
      routes: [
        { label: 'Knowledge Graph', path: '/graph', icon: 'graph' },
        { label: 'Visualization', path: '/visualization/bfs', icon: 'visualization' },
        { label: 'Notebooks', path: '/notebook', icon: 'notebook' },
        { label: 'Learning Map', path: '/learning-map', icon: 'learning-map' },
        { label: 'Submissions', path: '/submissions', icon: 'submissions' },
        { label: 'Mentor Dashboard', path: '/mentor-dashboard', icon: 'mentor' },
      ],
      collapsed: false,
    },
    {
      title: 'Admin',
      routes: [
        { label: 'Users', path: '/users', icon: 'users' },
        { label: 'Learning Paths', path: '/learning-paths', icon: 'learning-path' },
        { label: 'Principles', path: '/principles', icon: 'principles' },
        { label: 'Source Configs', path: '/source-configs', icon: 'source-config' },
        { label: 'Raw Content', path: '/raw-content', icon: 'raw-content' },
        { label: 'Knowledge Units', path: '/knowledge-units', icon: 'knowledge-unit' },
        { label: 'Completion Assessment', path: '/completion-assessment', icon: 'assessment' },
      ],
      collapsed: false,
    },
  ];

  toggleSection(index: number): void {
    this.sections[index].collapsed = !this.sections[index].collapsed;
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  getIcon(iconName: string): SafeHtml {
    let iconHtml = '';
    switch (iconName) {
      case 'home':
        iconHtml = homeIcon;
        break;
      case 'content':
        iconHtml = contentIcon;
        break;
      case 'challenges':
        iconHtml = challengesIcon;
        break;
      case 'schedule':
        iconHtml = scheduleIcon;
        break;
      case 'graph':
        iconHtml = graphIcon;
        break;
      case 'users':
        iconHtml = usersIcon;
        break;
      case 'learning-path':
        iconHtml = learningPathIcon;
        break;
      case 'source-config':
        iconHtml = sourceConfigIcon;
        break;
      case 'raw-content':
        iconHtml = rawContentIcon;
        break;
      case 'knowledge-unit':
        iconHtml = knowledgeUnitIcon;
        break;
      case 'visualization':
        iconHtml = visualizationIcon;
        break;
      case 'notebook':
        iconHtml = notebookIcon;
        break;
      case 'learning-map':
        iconHtml = learningMapIcon;
        break;
      case 'study':
        iconHtml = studyIcon;
        break;
      case 'principles':
        iconHtml = principlesIcon;
        break;
      case 'assessment':
        iconHtml = assessmentIcon;
        break;
      case 'submissions':
        iconHtml = submissionsIcon;
        break;
      case 'projects':
        iconHtml = projectsIcon;
        break;
      case 'mentor':
        iconHtml = mentorIcon;
        break;
      default:
        iconHtml = '';
    }
    return this.sanitizer.bypassSecurityTrustHtml(iconHtml);
  }

  ngOnInit(): void {
    // Initialize with current state
    this.isSidebarCollapsed = this.layoutService.isSidebarCollapsed;
    
    // Subscribe to sidebar collapsed state changes
    this.layoutService.isSidebarCollapsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(collapsed => {
        this.isSidebarCollapsed = collapsed;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

