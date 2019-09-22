require('dotenv').config();
const log = require("logg.js");
const express = require("express");
const bodyparser = require("body-parser");
const services = require("./services.json");
const commands = require("./commands.json");
const { WebhookClient, RichEmbed } = require("discord.js");
const { exec } = require('child_process');
const app = express();
app.use(bodyparser.json({ type: "application/json" }));
app.use(bodyparser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send({status: "error", code: 1, message: "There was no Endpoint specified."});
});
app.post("/", (req, res) => {
    res.send({status: "error", code: 2, message: "There was no Endpoint specified."});
});
app.get("/deploy/:app", (req, res) => {
    res.send({status: "error", code: 2, message: "This is a GET Request, you need to use a POST Request however."});
});
app.post("/deploy/:app", (req, res) => {
    services.forEach((service) => {
        if(req.params.app == service.url) {
            let startTime = new Date();
            if(service.webhooks.discord) {
                let embed = new RichEmbed()
                .setTitle(req.body.repository.full_name)
                .setDescription("Deploying `" + req.body.repository.full_name + "`...")
                .setFooter(req.body.head_commit.author.username)
                .setColor("#FFE100")
                .setTimestamp(Date.now());
                req.body.commits.forEach((commit) => {
                    embed.addField(commit.id.substring(0, 7), commit.message);
                });
                let webhook = new WebhookClient(service.webhooks.discord.split("/")[5], service.webhooks.discord.split("/")[6]);
                webhook.send(embed);
                webhook.destroy();
            }
            exec(commands[service.action.type].replace("%dir%", service.action.directory).replace("%pm2name%", service.action.pm2name), (error, stdout, stderror) => {
                if(error) {
                    if(service.webhooks.discord) {
                        let embed = new RichEmbed()
                        .setTitle(req.body.repository.full_name)
                        .setDescription("Error occured whilst deploying `" + req.body.repository.full_name + "`...")
                        .setFooter(req.body.head_commit.author.username)
                        .setColor("#FF2929")
                        .setTimestamp(Date.now());
                        let webhook = new WebhookClient(service.webhooks.discord.split("/")[5], service.webhooks.discord.split("/")[6]);
                        webhook.send(embed);
                        webhook.destroy();
                        return;
                    }
                }
                let endTime = new Date();
                if(service.webhooks.discord) {
                    let embed = new RichEmbed()
                    .setTitle(req.body.repository.full_name)
                    .setDescription("Successfully deployed `" + req.body.repository.full_name + "` in " + (startTime - endTime) + "ms.")
                    .setFooter(req.body.head_commit.author.username)
                    .setColor("#87FF44")
                    .setTimestamp(Date.now());
                    let webhook = new WebhookClient(service.webhooks.discord.split("/")[5], service.webhooks.discord.split("/")[6]);
                    webhook.send(embed);
                    webhook.destroy();
                }
            });
        }
    });
});

let server = app.listen(process.env.EXPRESS_PORT, process.env.EXPRESS_IP, () => {
    log.info("Express is now running on " + process.env.EXPRESS_IP + ":" + process.env.EXPRESS_PORT);
});