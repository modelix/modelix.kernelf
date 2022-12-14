import com.github.gradle.node.npm.task.NpmInstallTask
import com.github.gradle.node.npm.task.NpmSetupTask

plugins {
  base
  id("com.github.node-gradle.node") version "3.4.0"
}

node {
    version.set("18.3.0")
    npmVersion.set("8.11.0")
    download.set(true)
}

val modelixCoreVersion: String by rootProject

tasks.named("npm_run_build") {
  inputs.dir("src")
  inputs.file("package.json")
  inputs.file("package-lock.json")

  outputs.dir("dist")
}

tasks.named("assemble") {
  dependsOn("npm_run_build")
}

val updateTsModelApiVersion = tasks.create("updateTsModelApiVersion") {
  doLast {
    val localPath = rootDir.parentFile.resolve("modelix.core").resolve("ts-model-api").relativeTo(projectDir)
    val packageJsonFile = projectDir.resolve("package.json")
    var text = packageJsonFile.readText()
    println("ts-model-api path: $localPath")
    val replacement = if (localPath.exists()) {
      """"@modelix/ts-model-api": "file:$localPath""""
    } else {
      """"@modelix/ts-model-api": "$modelixCoreVersion""""
    }
    println("ts-model-api version: $replacement")
    text = text.replace(Regex(""""@modelix/ts-model-api": ".*""""), replacement)
    packageJsonFile.writeText(text)
  }
}

tasks.withType<NpmSetupTask> {
  dependsOn(updateTsModelApiVersion)
  dependsOn(":kernelf-apigen:generateMetaModelSources")
  dependsOn(":kernelf-editor:jsBrowserDistribution")
}
