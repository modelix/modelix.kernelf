import {Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { KernelfApiJS, org } from 'kernelf-editor';
import { DomSanitizer } from "@angular/platform-browser";
import { PipeTransform, Pipe } from "@angular/core";
import {TypedNode, INodeJS, LanguageRegistry, ITypedNode} from "@modelix/ts-model-api";
import {
  isOfConcept_INamedConcept,
  N_INamedConcept
} from "../../gen/L_jetbrains_mps_lang_core";

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  encapsulation : ViewEncapsulation.None
})
export class TextEditorComponent implements OnInit {

  @Input()
  public node!: any; // org.modelix.model.api.INode or TypedNode or INodeJS

  @ViewChild('editorContainer') editorContainer: ElementRef | undefined;

  constructor() {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(){
    if (this.editorContainer) {
      let dom = KernelfApiJS.renderAndUpdateNodeAsDom(this.getUnwrappedNode());
      let nativeElement: HTMLElement = this.editorContainer.nativeElement;
      nativeElement.appendChild(dom);
    }
  }

  public get nodeName(): string {
    let name = this.getNamedConcept()?.name;
    return name === undefined ? "" : name
  }

  public set nodeName(value: string) {
    if (this.nodeName !== value) {
      let named = this.getNamedConcept();
      if (named !== undefined) named.name = value
    }
  }

  public getUnwrappedNode(): any {
    if (this.node instanceof TypedNode) return org.modelix.model.api.JSNodeConverter.nodeFromJs(this.node.node)
    if (org.modelix.model.api.JSNodeConverter.isJsNode(this.node)) return org.modelix.model.api.JSNodeConverter.nodeFromJs(this.node)
    return this.node // INode
  }

  public getJSNode(): INodeJS {
    if (org.modelix.model.api.JSNodeConverter.isJsNode(this.node)) return this.node as INodeJS
    return org.modelix.model.api.JSNodeConverter.nodeToJs(this.getUnwrappedNode())
  }

  public getTypedNode(): ITypedNode {
    if (this.node instanceof TypedNode) return this.node
    return LanguageRegistry.INSTANCE.wrapNode(this.getJSNode())
  }

  public getTitle(): string {
    return KernelfApiJS.nodeToString(this.getUnwrappedNode())
  }

  public getNamedConcept(): N_INamedConcept | undefined {
    let typedNode = this.getTypedNode();
    return isOfConcept_INamedConcept(typedNode) ? typedNode : undefined
  }
}

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: string) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
