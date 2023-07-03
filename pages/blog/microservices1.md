---
title: Building Microservices With Go
date: 07/02/2023
description: Introduction to microservices (Pt 1.)
tag: go
author: Nicholas DiPreta
---

Hey there, and welcome to building Microservices With Go. I want to show you how easy it is to build microservices with Go! Over the next set of weeks, and probably months, I am going to go through all of the concepts that I know about building a microservice architecture, and specifically how to do that with Go.

In this part, I want to show you just how easy it is to build a microservice in Go. It will be a kind of generic "hello world" example but I want you to start getting into the structure of Go code.

I'll be putting out one of these each Sunday, starting Sunday July 2nd 2023.

---

### Setup

Question: What do you need to program microservices in Go?

Answer: Not a lot.

#### IDE

I use Visual Studio Code on a Mac machine, but you can do it on a windows machine as well. Visual Studio Code is a really nice tool. It's free, it's versatile, and cross platform.

#### Extensions

The only real must-have extension is the [Go language support](https://marketplace.visualstudio.com/items?itemName=golang.Go) for Visual Studio code. It gives you great features like intellisense and will unlock a lot of productivity.

#### Installations

Go is really easy to install. You can just grab that from Golang.org.

---

### Before We Start: A note on dependency managment

We'll be doing our dependency management with [Go mod](https://go.dev/ref/mod). Go mod is a package management tool for Go. It's used to manage dependencies and versions of
Go packages. To initialize your project using Go mod, simply run `go mod init <module name>`.

To add a dependency to your project, you can use the `go get` command.

### Start With A Service

So we're building a service in go.

The first thing to do is to create a `main.go`. At the top of main.go is always going to be the package name. For main, it is always  `package main`.

```Go
package main

func main(){
  
}
```

Now, nothing much is going to go on there, but it's a starting point. What I want to do is create a web server. In Go, what I can use is the http package. The http package has a huge amount of capability for building your own web services. It's pretty comprehensive. The absolute basics of creating a web service are though are:

```Go
package main

import "net/http"

func main(){

  http.ListenAndServe()
}
```

ListenAndServe is a function in net/http. It takes two parameters. It takes an address of type String and a handler of type http.Handler.

Let's break this down.

First, let's talk about the address, or the bind address. Here you can choose to explicitly choose an IP address and/or a port to listen on.

explicit ip = ```127.0.0.1:9090``` or
all ips on machine = ```:9090```

For this service we're just going to say all ips on the local machine on port 9090.

Let's leave the handler empty for now and see what happens.

```Go
package main

import "net/http"

func main(){

  http.ListenAndServe(":9090",nil)
}
```

You can run it in your command line through the command:
```go run main.go```

Open up another terminal and curl localhost:9090:
```curl -v localhost:9090```

You'll get a 404 response. But you do get a response. Well, there's nothing really going on.

So how do we make things happen? How do we handle simple requests to that http server? The answer, is through http handlers.

---

### A Really Really Basic Http Handler

Let's look at a really really basic http handler.

To create a really really basic http handler, we'll use the net/http package again.

For this we're going to use the `http.HandleFunc` method. First we pass it a path, and then we pass it a function. When a request comes in that matches this path, it's going to execute this function. The function signature is ```func(http.ResponseWriter, *http.Request)```. We'll look at these parameters in a little bit, bit for now, thats the basics.

```Go
package main

import (
 "log"
 "net/http"
)

func main() {

 http.HandleFunc("/", func(http.ResponseWriter, *http.Request) {
  log.Println("Hello World")
 })

 http.ListenAndServe(":9090", nil)
}
```

Now, when we run the server and curl again. We'll see the expected `hello world` response.

So what's actually going on here? Let's break this down.

What is `HandleFunc` ? `HandleFunc` is a convenience method on the http package. It registers a function to a path on a thing called `DefaultServeMux`.

`DefaultServeMux` is, you guessed it, the default ServeMux used by Serve. In terms of an object, it is an HTTP Request Multiplexer. You might know multiplexers as routers. So yes, it's the default request router.

So to sum it all up, what we're doing here is giving a function to the `HandleFunc` method, and creating an http handler from it, and adds it to the `DefaultServeMux`

When I then call ```http.ListenAndServe```, what's happening is ```ListenAndServe``` is using the ```DefaultServeMux``` as its root handler to determine which code block gets executed when I have a request.

Let's add another handler.

This time, let's add a goodbye.

```Go
package main

import (
 "log"
 "net/http"
)

func main() {

 http.HandleFunc("/", func(http.ResponseWriter, *http.Request) {
  log.Println("Hello World")
 })

 http.HandleFunc("/goodbye", func(http.ResponseWriter, *http.Request) {
  log.Println("Goodbye World")
 })

 http.ListenAndServe(":9090", nil)
}
```

This time when we run the code and `curl localhost:9090` and then `curl localhost:9090/goodbye` , we see the following output:

```bash
2023/07/03 13:52:17 Hello World
2023/07/03 13:52:29 Goodbye World
```

The reason for that, is that when the path matches "goodbye", it executes the function in the "goodbye" code block. When anything other than goodbye is present, it will exectue the "non-goodbye" code block.

So that's great. We've got hello world, and goodbye world. A couple of simple paths. But, it's only logging. That's not really useful. How do we do things like read and write to that request? Stay tuned for part two of this blog series, where we'll dive into that!
