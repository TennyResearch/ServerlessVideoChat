# What's in this Folder

This folder contains the code as it is at the end of Lecture 52. In this lecture, we use the identity token we received from Cognito to
authenticate our connection to the Signal Server. We build out a new lambda function to handle the $connect route. This new lambda function verifies
the identity token we passed as a query string parameter to the websocket server.
