console.log('background is working...')

sendNotify({
    title: 'hello',
    message: 'hello world!!!'
}).then(() => console.log('hello world!!'))


async function sendNotify({title, message}){
    console.log('sending notification')
    return browser.notifications.create({
        type: 'basic',
        title,
        message
    })
}


