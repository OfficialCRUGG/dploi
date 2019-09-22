const router = require('express').Router();
const log = require("logg.js");
const services = require("./services.json");
const commands = require("./commands.json");
const { WebhookClient, RichEmbed } = require("discord.js");
const { exec } = require('child_process');

router.get("/:app", (req, res) => {
    res.send({status: "error", code: 2, message: "This is a GET Request, you need to use a POST Request however."});
});
router.post("/:app", (req, res) => {
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